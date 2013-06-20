// ==========================================
// BOWER: Package Object Definition
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================
// Events:
//  - install: fired when package installed
//  - resolve: fired when deps resolved
//  - error: fired on all errors
//  - data: fired when trying to output data
// ==========================================

var fstream    = require('fstream');
var mkdirp     = require('mkdirp');
var events     = require('events');
var rimraf     = require('rimraf');
var semver     = require('semver');
var async      = require('async');
var https      = require('https');
var http       = require('http');
var path       = require('path');
var glob       = require('glob');
var url        = require('url');
var tmp        = require('tmp');
var fs         = require('fs');
var crypto     = require('crypto');
var unzip      = require('unzip');
var tar        = require('tar');
var _          = require('lodash');
var hogan      = require('hogan.js');

var config     = require('./config');
var source     = require('./source');
var template   = require('../util/template');
var readJSON   = require('../util/read-json');
var fileExists = require('../util/file-exists');
var fallback   = require('../util/fallback');
var isRepo     = require('../util/is-repo');
var git        = require('../util/git-cmd');
var UnitWork   = require('./unit_work');

var Package = function (name, endpoint, manager) {
  this.dependencies = {};
  this.json         = {};
  this.name         = name;
  this.manager      = manager;
  this.unitWork     = manager ? manager.unitWork : new UnitWork;
  this.opts         = manager ? manager.opts : {};
  this.explicitName = true;

  var split;

  if (endpoint) {
    if (/^(.*\.git)$/.exec(endpoint)) {
      this.gitUrl = RegExp.$1.replace(/^git\+/, '');
      this.tag    = false;

    } else if (/^(.*\.git)#(.*)$/.exec(endpoint)) {
      this.tag    = RegExp.$2;
      this.gitUrl = RegExp.$1.replace(/^git\+/, '');

    } else if (/^(?:(git):|git\+(https?):)\/\/([^#]+)#?(.*)$/.exec(endpoint)) {
      this.gitUrl = (RegExp.$1 || RegExp.$2) + '://' + RegExp.$3;
      this.tag    = RegExp.$4;

    } else if (semver.validRange(endpoint)) {
      this.tag = endpoint;
      this.explicitName = false;

    } else if (/^[\.\/~]\.?[^.]*\.(js|css)/.test(endpoint) && fs.statSync(endpoint).isFile()) {
      this.path      = path.resolve(endpoint);
      this.assetType = path.extname(endpoint);

    } else if (/^https?:\/\//.exec(endpoint)) {
      this.assetUrl  = endpoint;
      this.assetType = path.extname(endpoint);

    } else if (fileExists.sync((split = endpoint.split('#', 2))[0]) && fs.statSync(split[0]).isDirectory()) {
      this.path = path.resolve(split[0]);
      this.tag  = split[1];

    } else if (/^[\.\/~]/.test(endpoint)) {
      this.path = path.resolve(endpoint);

    } else if (endpoint.split('/').length === 2) {
      this.gitUrl = this.resolveShorthand(config.shorthand_resolver, (split = endpoint.split('#', 2))[0]);
      this.tag = split[1];
      this.shorthand = endpoint;

    } else {
      split = endpoint.split('#', 2);
      this.tag = split[1];
    }

    // Guess names
    if (!this.name) {
      this.name = this.guessName(split && split[0]);
      this.explicitName = false;
    } else {
      this.explicitName = true;
    }

    this.cacheName = this.name;

    // Store a reference to the original tag & original path
    // This is because the tag & paths can get rewritten later
    if (this.tag) this.originalTag = this.tag;
    if (this.path) this.originalPath = endpoint;
    if (this.assetUrl) this.originalAssetUrl = this.assetUrl;

    // The id is an unique id that describes this package
    this.id = crypto.createHash('md5').update(this.name + '%' + this.tag + '%' + this.gitUrl +  '%' + this.path + '%' + this.assetUrl).digest('hex');

    // Generate a resource id
    if (this.gitUrl) this.generateResourceId();
  }

  if (this.manager) {
    this.on('data',  this.manager.emit.bind(this.manager, 'data'));
    this.on('warn',  this.manager.emit.bind(this.manager, 'warn'));
    this.on('error', function (err, origin) {
      // Unlock the unit of work automatically on error (only if the error is from this package)
      if (!origin && this.unitWork.isLocked(this.cacheName)) this.unitWork.unlock(this.cacheName, this);
      // Propagate the error event to the parent package/manager
      this.manager.emit('error', err, origin || this);
    }.bind(this));
  }

  // Cache a self bound function
  this.waitUnlock = this.waitUnlock.bind(this);

  this.setMaxListeners(30);   // Increase the number of listeners because a package can have more than the default 10 dependencies
};

Package.prototype = Object.create(events.EventEmitter.prototype);

Package.prototype.constructor = Package;

Package.prototype.resolve = function () {
  // Ensure that nobody is resolving the same dep at the same time
  // If there is, we wait for the unlock event
  if (this.unitWork.isLocked(this.cacheName)) return this.unitWork.on('unlock', this.waitUnlock);

  var data = this.unitWork.retrieve(this.cacheName);
  if (data) {
    // Check if this exact package is the last resolved one
    // If so, we copy the resolved result and we don't need to do anything else
    if (data.id === this.id) {
      this.unserialize(data);
      this.emit('resolve');
      return this;
    }
  }

  // If not, we lock and resolve it
  this.unitWork.lock(this.cacheName, this);

  if (this.assetUrl) {
    this.download();
  } else if (this.gitUrl) {
    this.clone();
  } else if (this.path) {
    this.copy();
  } else {
    this.once('lookup', this.clone).lookup();
  }

  return this;
};

Package.prototype.lookup = function () {
  source.lookup(this.name, function (err, url) {
    if (err) return this.emit('error', err);
    this.lookedUp = true;
    this.gitUrl = url;
    this.generateResourceId();
    this.emit('lookup');
  }.bind(this));
};

Package.prototype.install = function () {
  // Only print the installing action if this package has been resolved
  if (this.unitWork.retrieve(this.cacheName)) {
    template('action', { name: 'installing', shizzle: this.name + (this.version ? '#' + this.version : '') })
      .on('data', this.emit.bind(this, 'data'));
  }

  var localPath = this.localPath;

  if (path.resolve(this.path) === localPath) {
    this.emit('install');
    return this;
  }

  // Remove stuff from the local path (if any)
  // Rename path to the local path
  // Beware that if the local path exists and is a git repository, the process is aborted
  isRepo(localPath, function (is) {
    if (is) {
      var err = new Error('Local path is a local repository');
      err.details = 'To avoid losing work, please remove ' + localPath + ' manually.';
      return this.emit('error', err, this);
    }

    mkdirp(path.dirname(localPath), function (err) {
      if (err) return this.emit('error', err);
      rimraf(localPath, function (err) {
        if (err) return this.emit('error', err);
        return fs.rename(this.path, localPath, function (err) {
          if (!err) return this.cleanUpLocal();

          var writter = fstream.Writer({
            type: 'Directory',
            path: localPath
          });
          writter
            .on('error', this.emit.bind(this, 'error'))
            .on('end', rimraf.bind(this, this.path, this.cleanUpLocal.bind(this)));

          fstream.Reader(this.path)
            .on('error', this.emit.bind(this, 'error'))
            .pipe(writter);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));

  return this;
};

Package.prototype.cleanUpLocal = function () {
  this.once('readLocalConfig', function () {
    this.json.name    = this.name;
    this.json.version = this.commit ? '0.0.0' : this.version || '0.0.0';

    // Detect commit and save it in the json for later use
    if (this.commit) this.json.commit = this.commit;
    else delete this.json.commit;

    if (this.gitUrl) this.json.repository = { type: 'git', url: this.gitUrl };
    else if (this.gitPath) this.json.repository = { type: 'local-repo', path: this.originalPath };
    else if (this.originalPath) this.json.repository = { type: 'local', path: this.originalPath };
    else if (this.assetUrl) this.json = this.generateAssetJSON();

    var jsonStr = JSON.stringify(this.json, null, 2);

    // Save json file
    async.parallel({
      'local': function (next) {
        fs.writeFile(path.join(this.localPath, this.localConfig.json), jsonStr, next);
      }.bind(this),
      'git-path': function (next) {
        if (!this.gitPath) return next();
        fileExists(this.gitPath, function (exists) {
          if (!exists) return next();
          fs.writeFile(path.join(this.gitPath, this.localConfig.json), jsonStr, next);
        }.bind(this));
      }.bind(this)
    }, function (err) {
      if (err) return this.emit('error', err);
      this.removeLocalPaths();
    }.bind(this));

  }.bind(this)).readLocalConfig();
};

// finish clean up local by removing .git/ and any ignored files
Package.prototype.removeLocalPaths = function () {
  var removePatterns = ['.git'];
  if (this.json.ignore) {
    removePatterns.push.apply(removePatterns, this.json.ignore);
  }

  var removePaths = [];

  // 3: done
  var pathsRemoved = function (err) {
    if (err) return this.emit('error', err);
    this.emit('install');
  }.bind(this);

  // 2: trigger after paths have been globbed
  var rimrafPaths = function (err) {
    if (err) return this.emit('error', err);
    async.forEach(removePaths, function (removePath, next) {
      // rimraf all the paths
      rimraf(path.join(this.localPath, removePath), next);
    }.bind(this), pathsRemoved);
  }.bind(this);

  // 1: get paths
  var globOpts = { dot: true, cwd: this.localPath };
  async.forEach(removePatterns, function (removePattern, next) {
    // glob path for file path pattern matching
    glob(removePattern, globOpts, function (err, globPaths) {
      if (err) return next(err);
      removePaths.push.apply(removePaths, globPaths);
      next();
    }.bind(this));
  }.bind(this), rimrafPaths);
};

Package.prototype.generateAssetJSON = function () {
  return {
    name: this.name,
    main: this.assetType !== '.zip' && this.assetType !== '.tar' ? 'index' + this.assetType : '',
    version: '0.0.0',
    repository: { type: 'asset', url: this.originalAssetUrl }
  };
};

Package.prototype.uninstall = function () {
  template('action', { name: 'uninstalling', shizzle: this.path })
    .on('data', this.emit.bind(this, 'data'));
  rimraf(this.path, function (err) {
    if (err) return this.emit('error', err);
    this.emit('uninstall');
  }.bind(this));
};

// Private
Package.prototype.guessName = function (fallback) {
  if (this.gitUrl) return path.basename(this.gitUrl).replace(/(\.git)?(#.*)?$/, '');
  if (this.path) return path.basename(this.path, this.assetType);
  if (this.assetUrl) return path.basename(this.assetUrl, this.assetType);
  return fallback;
};

Package.prototype.findJSON = function () {
  fallback(this.path, [config.json, 'bower.json', 'component.json'], function (name) {
    if (name) {
      if (name === 'component.json') {
        this.emit('warn', 'Package ' + this.name + ' is still using the deprecated "component.json" file');
      }
      this.localConfig.json = name;
    }
    this.emit('readLocalConfig');
  }.bind(this));
};

Package.prototype.readLocalConfig = function () {
  if (this.localConfig) return this.emit('readLocalConfig');

  fs.readFile(path.join(this.path, '.bowerrc'), function (err, file) {
    // If the local .bowerrc file do not exists then we check if the
    // json specific in the config exists (if not, we fallback to bower.json)
    if (err) {
      this.localConfig = { json: config.json };
      this.findJSON();
    } else {
      // If the local .bowerrc file exists, we read it and check if a custom json file
      // is defined. If not, we check if the global config json file exists (if not, we fallback to bower.json)
      try {
        this.localConfig = JSON.parse(file);
      } catch (e) {
        return this.emit('error', new Error('Unable to parse local .bowerrc file: ' + e.message));
      }

      if (!this.localConfig.json) {
        this.localConfig.json = config.json;
        return this.findJSON();
      }

      this.emit('readLocalConfig');
    }
  }.bind(this));
};

Package.prototype.loadJSON = function () {
  if (!this.path || this.assetUrl) return this.emit('loadJSON');

  this.once('readLocalConfig', function () {
    var jsonFile = path.join(this.path, this.localConfig.json);
    fileExists(jsonFile, function (exists) {
      // If the json does not exists, we attempt to get the version
      if (!exists) {
        return this.once('describeTag', function (tag) {
          tag = semver.clean(tag);
          if (!tag) this.version = this.tag;
          else {
            this.version = tag;
            if (!this.tag) this.tag = this.version;
          }

          this.emit('loadJSON');
        }.bind(this)).describeTag();
      }

      readJSON(jsonFile, function (err, json) {
        if (err) {
          err.details = 'An error was caught when reading the ' + this.localConfig.json + ': ' + err.message;
          return this.emit('error', err);
        }

        this.json    = json;
        this.version = this.commit || json.commit || json.version;
        this.commit  = this.commit || json.commit;
        // Only overwrite the name if not already set
        // This is because some packages have different names declared in the registry and the json
        if (!this.name || !this.explicitName) {
          this.name = json.name;
        }

        // Read the endpoint from the json to ensure it is set correctly
        this.readEndpoint();

        // Detect if the tag mismatches the json.version
        // This is very often to happen because developers tag their new releases but forget to update the json accordingly
        var cleanedTag;
        if (this.tag && (cleanedTag = semver.clean(this.tag)) && cleanedTag !== this.version) {
          // Only print the warning once
          if (!this.unitWork.retrieve('mismatch#' + this.cacheName + '_' + cleanedTag)) {
            template('warning-mismatch', { name: this.cacheName, json: this.localConfig.json, tag: cleanedTag, version: this.version || 'N/A' })
              .on('data', this.emit.bind(this, 'data'));
            this.unitWork.store('mismatch#' + this.cacheName + '_' + cleanedTag, true);
          }
          // Assume the tag
          this.version = cleanedTag;
        }

        this.emit('loadJSON');
      }.bind(this), this);
    }.bind(this));
  }.bind(this)).readLocalConfig();
};

Package.prototype.download = function () {
  template('action', { name: 'downloading', shizzle: this.assetUrl })
    .on('data', this.emit.bind(this, 'data'));

  var src;

  if (config.proxy) {
    src = url.parse(config.proxy);
    src.path = this.assetUrl;
  } else {
    src  = url.parse(this.assetUrl);
  }

  tmp.dir({
    prefix: 'bower-' + this.name + '-',
    mode: parseInt('0777', 8) & (~process.umask()),
    unsafeCleanup: true
  }, function (err, tmpPath) {
    if (err) return this.emit('error', err);

    var req  = src.protocol === 'https:' ? https : http;
    req.get(src, function (res) {
      // If assetUrl results in a redirect we update the assetUrl to the redirect to url
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        template('action', { name: 'redirect detected', shizzle: res.headers.location})
          .on('data', this.emit.bind(this, 'data'));
        this.assetUrl = res.headers.location;
        return this.download();
      }

      // Detect not OK status codes
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return this.emit('error', new Error(res.statusCode + ' status code for ' + this.assetUrl));
      }

      var file = fs.createWriteStream(path.join((this.path = tmpPath), 'index' + this.assetType));

      res.on('data', function (data) {
        file.write(data);
      });

      res.on('end', function () {
        file.end();

        var next = function () {
          this.once('loadJSON', this.saveUnit).loadJSON();
        }.bind(this);

        if (this.assetType === '.zip' || this.assetType === '.tar') this.once('extract', next).extract();
        else next();
      }.bind(this));
    }.bind(this)).on('error', this.emit.bind(this, 'error'));
  }.bind(this));
};

Package.prototype.extract = function () {
  var file = path.join(this.path, 'index' + this.assetType);
  template('action', { name: 'extracting', shizzle: file }).on('data', this.emit.bind(this, 'data'));

  fs.createReadStream(file).pipe(this.assetType === '.zip' ? unzip.Extract({ path: this.path }) : tar.Extract({ path: this.path }))
    .on('error', this.emit.bind(this, 'error'))
    .on('close', function () {
      // Delete zip
      fs.unlink(file, function (err) {
        if (err) return this.emit('error', err);

        // If we extracted only a folder, move all the files within it to the original path
        fs.readdir(this.path, function (err, files) {
          if (err) return this.emit('error', err);

          if (files.length !== 1) return this.emit('extract');

          var dir = path.join(this.path, files[0]);
          fs.stat(dir, function (err, stat) {
            if (err) return this.emit('error', err);
            if (!stat.isDirectory()) return this.emit('extract');

            fs.readdir(dir, function (err, files) {
              if (err) return this.emit('error', err);

              async.forEachSeries(files, function (file, next) {
                fs.rename(path.join(dir, file), path.join(this.path, file), next);
              }.bind(this), function (err) {
                if (err) return this.emit('error');

                fs.rmdir(dir, function (err) {
                  if (err) return this.emit('error');
                  this.emit('extract');
                }.bind(this));
              }.bind(this));
            }.bind(this));
          }.bind(this));
        }.bind(this));
      }.bind(this));
    }.bind(this));
};

Package.prototype.copy = function () {
  template('action', { name: 'copying', shizzle: this.path }).on('data', this.emit.bind(this, 'data'));

  tmp.dir({
    prefix: 'bower-' + this.name + '-',
    unsafeCleanup: true
  }, function (err, tmpPath) {
    if (err) return this.emit('error', err);

    fs.stat(this.path, function (err, stats) {
      if (err) return this.emit('error', err);

      // Copy file permission for directory
      fs.chmod(tmpPath, stats.mode, function (err) {
        if (err) return this.emit('error', err);

        if (this.assetType) {
          return fs.readFile(this.path, function (err, data) {
            fs.writeFile(path.join((this.path = tmpPath), 'index' + this.assetType), data, function () {
              this.once('loadJSON', this.saveUnit).loadJSON();
            }.bind(this));
          }.bind(this));
        }

        this.once('loadJSON', function () {
          if (this.gitUrl) return this.saveUnit();

          // Check if the copied directory is a git repository and is a local endpoint
          // If so, treat it like a repository.
          fileExists(path.join(this.path, '.git'), function (exists) {
            if (!exists) return this.saveUnit();

            this.gitPath = this.path;
            this.once('loadJSON', this.saveUnit.bind(this)).checkout();
          }.bind(this));
        }.bind(this));

        var writter = fstream.Writer({
          type: 'Directory',
          path: tmpPath
        })
         .on('error', this.emit.bind(this, 'error'))
         .on('end', this.loadJSON.bind(this));

        fstream.Reader(this.path)
          .on('error', this.emit.bind(this, 'error'))
          .pipe(writter);

        this.path = tmpPath;
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Package.prototype.getDeepDependencies = function (result) {
  result = result || [];
  for (var name in this.dependencies) {
    result.push(this.dependencies[name]);
    this.dependencies[name].getDeepDependencies(result);
  }
  return result;
};

Package.prototype.saveUnit = function () {
  this.unitWork.store(this.cacheName, this.serialize(), this);
  this.unitWork.unlock(this.cacheName, this);
  this.addDependencies();
};

Package.prototype.addDependencies = function () {
  var dependencies = this.json.dependencies || {};
  var callbacks    = Object.keys(dependencies).map(function (name) {
    return function (callback) {
      var endpoint = dependencies[name];
      var pkg = new Package(name, endpoint, this);
      pkg.once('resolve', function () {
        this.dependencies[pkg.name] = pkg;
        callback();
      }.bind(this)).resolve();
    }.bind(this);
  }.bind(this));

  async.parallel(callbacks, function (err) {
    if (err) return this.emit('error', err);
    this.emit('resolve');
  }.bind(this));
};

Package.prototype.exists = function (callback) {
  fileExists(this.localPath, callback);
};

Package.prototype.clone = function () {
  template('action', { name: 'cloning', shizzle: this.gitUrl }).on('data', this.emit.bind(this, 'data'));
  this.path = this.gitPath;
  this.once('cache', function () {
    this.once('loadJSON', this.copy.bind(this)).checkout();
  }.bind(this)).cache();
};

Package.prototype.cache = function () {
  // If the force options is true, we need to erase from the cache
  // Be aware that a similar package might already flushed it
  // To prevent that we check the unit of work storage
  if (this.opts.force && !this.unitWork.retrieve('flushed#' + this.cacheName + '_' + this.resourceId)) {
    rimraf(this.path, function (err) {
      if (err) return this.emit('error', err);
      this.unitWork.store('flushed#' + this.cacheName + '_' + this.resourceId, true);
      this.cache();
    }.bind(this));
    return this;
  }

  mkdirp(config.cache, function (err) {
    if (err) return this.emit('error', err);
    fileExists(this.path, function (exists) {
      if (exists) {
        template('action', { name: 'cached', shizzle: this.gitUrl }).on('data', this.emit.bind(this, 'data'));
        return this.emit('cache');
      }
      template('action', { name: 'caching', shizzle: this.gitUrl }).on('data', this.emit.bind(this, 'data'));
      var url = this.gitUrl;
      if (config.proxy) {
        url = url.replace(/^git:/, 'https:');
      }

      mkdirp(this.path, function (err) {
        if (err) return this.emit('error', err);

        var cp = git(['clone', url, this.path], null, this);
        cp.on('close', function (code) {
          if (code) return;
          this.emit('cache');
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Package.prototype.checkout = function () {
  template('action', { name: 'fetching', shizzle: this.name })
    .on('data', this.emit.bind(this, 'data'));

  this.once('versions', function (versions) {
    if (!versions.length) {
      this.emit('checkout');
      this.loadJSON();
    }

    // If tag is specified, try to satisfy it
    if (this.tag) {
      if (!semver.validRange(this.tag)) {
        return this.emit('error', new Error('Tag ' + this.tag + ' is not a valid semver range/version'));
      }

      versions = versions.filter(function (version) {
        return semver.satisfies(version, this.tag);
      }.bind(this));

      if (!versions.length) {
        var error = new Error('Could not find tag satisfying: ' + this.name + '#' + this.tag);
        error.details = 'The tag ' + this.tag + ' could not be found within the repository';
        return this.emit('error', error);
      }
    }

    // Use latest version
    this.tag = versions[0];
    if (!semver.valid(this.tag)) this.commit = this.tag;  // If the version is not valid, then its a commit

    if (this.tag) {
      template('action', {
        name: 'checking out',
        shizzle: this.name + '#' + this.tag
      }).on('data', this.emit.bind(this, 'data'));

      // Checkout the tag
      git([ 'checkout', this.tag, '-f'], { cwd: this.path }, this).on('close', function (code) {
        if (code) return;
        // Ensure that checkout the tag as it is, removing all untracked files
        git(['clean', '-f', '-d'], { cwd: this.path }, this).on('close', function (code) {
          if (code) return;
          this.emit('checkout');
          this.loadJSON();
        }.bind(this));
      }.bind(this));
    }
  }).versions();
};

Package.prototype.describeTag = function () {
  var cp = git(['describe', '--always', '--tag'], { cwd: this.gitPath || this.path, ignoreCodes: [128] }, this);
  var tag = '';

  cp.stdout.setEncoding('utf8');
  cp.stdout.on('data',  function (data) {
    tag += data;
  });

  cp.on('close', function (code) {
    if (code === 128) tag = 'unspecified'; // Not a git repo
    this.emit('describeTag', tag.replace(/\n$/, ''));
  }.bind(this));
};

Package.prototype.versions = function () {
  this.once('fetch', function () {
    var cp = git(['tag'], { cwd: this.gitPath }, this);

    var versions = '';

    cp.stdout.setEncoding('utf8');
    cp.stdout.on('data',  function (data) {
      versions += data;
    });

    cp.on('close', function (code) {
      if (code) return;
      versions = versions.split('\n');
      versions = versions.filter(function (ver) {
        return semver.valid(ver);
      });
      versions = versions.sort(function (a, b) {
        return semver.gt(a, b) ? -1 : 1;
      });

      if (versions.length) return this.emit('versions', versions);

      // If there is no versions tagged in the repo
      // then we grab the hash of the last commit
      versions = '';
      cp = git(['log', '-n', 1, '--format=%H'], { cwd: this.gitPath }, this);

      cp.stdout.setEncoding('utf8');
      cp.stdout.on('data', function (data) {
        versions += data;
      });
      cp.on('close', function (code) {
        if (code) return;
        versions = _.compact(versions.split('\n'));
        this.emit('versions', versions);
      }.bind(this));
    }.bind(this));
  }.bind(this)).fetch();
};

Package.prototype.fetch = function () {
  fileExists(this.gitPath, function (exists) {
    if (!exists) return this.emit('error', new Error('Unable to fetch package ' + this.name + ' (if the cache was deleted, run install again)'));

    var cp = git(['fetch', '--prune'], { cwd: this.gitPath }, this);
    cp.on('close', function (code) {
      if (code) return;
      cp = git(['reset', '--hard', this.gitUrl ? 'origin/HEAD' : 'HEAD'], { cwd: this.gitPath }, this);
      cp.on('close', function (code) {
        if (code) return;
        this.emit('fetch');
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

Package.prototype.readEndpoint = function (replace) {
  if (!this.json.repository) return;

  if (this.json.repository.type === 'git') {
    if (replace || !this.gitUrl) {
      this.gitUrl = this.json.repository.url;
      this.generateResourceId();
    }
    return { type: 'git', endpoint: this.gitUrl };
  }
  if (this.json.repository.type === 'local-repo') {
    if (replace || !this.gitPath) {
      this.gitPath = path.resolve(this.json.repository.path);
    }
    return { type: 'local', endpoint: this.path };
  }
  if (this.json.repository.type === 'local') {
    if (replace || !this.originalPath) {
      this.originalPath = this.path = path.resolve(this.json.repository.path);
    }
    return { type: 'local', endpoint: this.originalPath };
  }
  if (this.json.repository.type === 'asset') {
    if (replace || !this.assetUrl) {
      this.originalAssetUrl = this.assetUrl = this.json.repository.url;
      this.assetType = path.extname(this.assetUrl);
    }
    return { type: 'asset', endpoint: this.originalAssetUrl };
  }
};

Package.prototype.waitUnlock = function (cacheName) {
  if (this.cacheName === cacheName) {
    this.unitWork.removeListener('unlock', this.waitUnlock);
    this.resolve();
  }
};

Package.prototype.serialize = function () {
  return {
    id: this.id,
    resourceId: this.resourceId,
    path: this.path,
    originalPath: this.originalPath,
    tag: this.tag,
    originalTag: this.originalTag,
    commit: this.commit,
    assetUrl: this.assetUrl,
    originalAssetUrl: this.originalAssetUrl,
    assetType: this.assetType,
    lookedUp: this.lookedUp,
    json: this.json,
    gitUrl: this.gitUrl,
    gitPath: this.gitPath,
    dependencies: this.dependencies,
    localConfig: this.localConfig
  };
};

Package.prototype.unserialize = function (obj) {
  for (var key in obj) {
    this[key] = obj[key];
  }

  this.version = this.tag;
};

Package.prototype.generateResourceId = function () {
  this.resourceId = crypto.createHash('md5').update(this.gitUrl).digest('hex');
  this.gitPath = path.join(config.cache, this.cacheName, this.resourceId);

  // If we are not in the middle of the resolve process and if the cache folder
  // does not exists, try guessing it again from the new gitUrl
  if (!this.unitWork.isLocked(this.cacheName) && !fs.existsSync(this.gitPath)) {
    this.cacheName = this.guessName(this.cacheName);
    this.gitPath = path.join(config.cache, this.cacheName, this.resourceId);
  }
};

Package.prototype.resolveShorthand = function (shorthand, path) {
  shorthand = hogan.compile(shorthand);

  var parts = path.split('/');

  return shorthand.render({
    organization: parts[0],
    package: parts[1],
    endpoint: path
  });
};

Object.defineProperty(Package.prototype, 'localPath', {
  get: function () {
    return path.join(process.cwd(), config.directory, this.name);
  }
});

module.exports = Package;
