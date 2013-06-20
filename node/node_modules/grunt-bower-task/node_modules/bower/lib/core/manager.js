// ==========================================
// BOWER: Manager Object Definition
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================
// Events:
//  - install: fired when everything is installed
//  - package: fired for each installed packaged
//  - resolve: fired when deps resolved (with a true/false indicating success or error)
//  - error: fired on all errors
//  - data: fired when trying to output data
//  - warn: fired when a discouraged but not fatal situation arises
//  - end: fired when finished installing
// ==========================================

var events     = require('events');
var semver     = require('semver');
var async      = require('async');
var path       = require('path');
var glob       = require('glob');
var fs         = require('fs');
var _          = require('lodash');

var Package    = require('./package');
var UnitWork   = require('./unit_work');
var config     = require('./config');
var fallback   = require('../util/fallback');
var template   = require('../util/template');
var prune      = require('../util/prune');

// read local dependencies (with versions)
// read json dependencies (resolving along the way into temp dir)
// merge local dependencies with json dependencies
// prune and move dependencies into local directory

var Manager = function (endpoints, opts) {
  this.dependencies    = {};
  this.cwd             = process.cwd();
  this.endpoints       = endpoints || [];
  this.unitWork        = new UnitWork;
  this.opts            = opts || {};
  this.errors          = [];
};

Manager.prototype = Object.create(events.EventEmitter.prototype);
Manager.prototype.constructor = Manager;

Manager.prototype.loadJSON = function () {
  fallback(this.cwd, [config.json, 'component.json'], function (file) {
    if (file !== null) {
      if (file !== config.json) {
        this.emit('warn', 'Using deprecated "component.json". Please use "bower.json" instead');
      }

      return this.readJSON(path.join(this.cwd, file));
    }

    this.createJSON();
    return this.emit('loadJSON');
  }.bind(this));

  return this;
};

Manager.prototype.resolve = function () {
  var resolved = function () {
    // If there is errors, report them
    if (this.errors.length) return this.reportErrors();
    // If there is an error while pruning (conflict) then abort installation
    if (!this.prune()) return this.emit('resolve', false);
    // Otherwise all is fine, so we install
    this.once('install', this.emit.bind(this, 'resolve', true)).install();
  }.bind(this);

  // Resolve locally first
  this.once('resolveLocal', function () {
    if (this.endpoints.length) {
      // TODO: When resolving specific endpoints we need to restore all the local
      //       packages and their hierarchy (all from the local folder)
      //       If something goes wrong, simply do resolveFromJSON before
      //       calling resolved() (slower)
      //       This will solve issue #200
      this.once('resolveEndpoints', resolved).resolveEndpoints();
    } else {
      this.once('resolveFromJson', resolved).resolveFromJson();
    }
  }).resolveLocal();

  return this;
};

Manager.prototype.resolveLocal = function () {
  glob('./' + config.directory + '/*', function (err, dirs) {
    if (err) return this.emit('error', err);
    dirs.forEach(function (dir) {
      var name = path.basename(dir);
      var pkg = new Package(name, dir, this);

      this.dependencies[name] = [];
      this.dependencies[name].push(pkg);

      this.gatherPackageErrors(pkg);
    }.bind(this));
    this.emit('resolveLocal');
  }.bind(this));

  return this;
};

Manager.prototype.resolveEndpoints = function () {
  var endpointNames = this.opts.endpointNames || {};

  async.forEach(this.endpoints, function (endpoint, next) {
    var name = endpointNames[endpoint];
    var pkg  = new Package(name, endpoint, this);
    var errorNext;

    pkg.root = true;
    this.dependencies[name] = this.dependencies[name] || [];
    this.dependencies[name].push(pkg);

    this.gatherPackageErrors(pkg);
    pkg.once('error', errorNext = next.bind(next, null));
    pkg.once('resolve', function () {
      pkg.removeListener('error', errorNext);
      next();
    }).resolve();
  }.bind(this), this.emit.bind(this, 'resolveEndpoints'));

  return this;
};

Manager.prototype.resolveFromJson = function () {
  this.once('loadJSON', function () {
    var dependencies = this.json.dependencies || {};

    // add devDependencies
    if (!this.opts.production && this.json.devDependencies) {
      dependencies = _.extend({}, dependencies, this.json.devDependencies);
    }

    async.forEach(Object.keys(dependencies), function (name, next) {
      var endpoint = dependencies[name];
      var pkg      = new Package(name, endpoint, this);
      var errorNext;

      pkg.root = true;

      this.gatherPackageErrors(pkg);

      pkg.once('error', errorNext = next.bind(next, null));
      pkg.once('resolve', function () {
        pkg.removeListener('error', errorNext);

        this.dependencies[pkg.name] = this.dependencies[pkg.name] || [];
        this.dependencies[pkg.name].push(pkg);

        next();
      }.bind(this)).resolve();
    }.bind(this), this.emit.bind(this, 'resolveFromJson'));
  }.bind(this)).loadJSON();

  return this;
};

// Private
Manager.prototype.createJSON = function () {
  // If the json does not exist, assume one
  this.json = {
    name: path.basename(this.cwd),
    version: '0.0.0'
  },
  this.name = this.json.name;
  this.version = this.json.version;
};

Manager.prototype.readJSON = function (filename) {
  fs.readFile(filename, 'utf8', function (err, json) {
    if (err) return this.emit('error', err);
    try {
      this.json = JSON.parse(json);
    } catch (e) {
      return this.emit('error', new Error('There was an error while reading the ' + config.json + ': ' + e.message));
    }
    this.name    = this.json.name;
    this.version = this.json.version;
    this.emit('loadJSON', json.slice(-1) === '\n');
  }.bind(this));
};

Manager.prototype.getDeepDependencies = function () {
  var result = {};

  for (var name in this.dependencies) {
    this.dependencies[name].forEach(function (pkg) {
      result[pkg.name] = result[pkg.name] || [];
      result[pkg.name].push(pkg);
      pkg.getDeepDependencies().forEach(function (pkg) {
        result[pkg.name] = result[pkg.name] || [];
        result[pkg.name].push(pkg);
      });
    });
  }

  return result;
};

Manager.prototype.prune = function () {
  var result = prune(this.getDeepDependencies(), this.opts.forceLatest);
  var name;

  // If there is conflicted deps, print them and fail
  if (result.conflicted) {
    for (name in result.conflicted) {
      this.reportConflicts(name, result.conflicted[name]);
    }

    return false;
  }

  this.dependencies = {};

  // If there is conflicted deps but they where forcebly resolved
  // Print a warning about them
  if (result.forceblyResolved) {
    for (name in result.forceblyResolved) {
      this.reportForceblyResolved(name, result.forceblyResolved[name]);
      this.dependencies[name] = result.forceblyResolved[name];
      this.dependencies[name][0].root = true;
    }
  }

  _.extend(this.dependencies, result.resolved);

  return true;
};

Manager.prototype.gatherPackageErrors = function (pkg) {
  pkg.on('error', function (err, origin) {
    pkg = origin || pkg;

    // If the error message starts with the package name, strip it
    if (!err.message.indexOf(pkg.name + ' ')) {
      err.message = err.message.substr(pkg.name.length + 1);
    }

    this.errors.push({ pkg: pkg, error: err });
  }.bind(this));
};

Manager.prototype.install = function () {
  async.forEach(Object.keys(this.dependencies), function (name, next) {
    var pkg = this.dependencies[name][0];
    pkg.once('install', function () {
      this.emit('package', pkg);
      next();
    }.bind(this)).install();
    pkg.once('error', next);
  }.bind(this), function () {
    if (this.errors.length) this.reportErrors();
    return this.emit('install');
  }.bind(this));
};

Manager.prototype.muteDependencies = function () {
  for (var name in this.dependencies) {
    this.dependencies[name].forEach(function (pkg) {
      pkg.removeAllListeners();
      pkg.on('error', function () {});
    });
  }
};

Manager.prototype.reportErrors = function () {
  this.muteDependencies();
  template('error-summary', { errors: this.errors }).on('data', function (data) {
    this.emit('data', data);
    this.emit('resolve', false);
  }.bind(this));
};

Manager.prototype.reportConflicts = function (name, packages) {
  var versions = [];
  var requirements = [];

  packages = packages.filter(function (pkg) { return !!pkg.version; });
  packages.forEach(function (pkg) {
    requirements.push({ pkg: pkg, tag: pkg.originalTag || '~' + pkg.version });
    versions.push((pkg.originalTag || '~' + pkg.version).white);
  });

  this.emit('error', new Error('No resolvable version for ' + name));
  this.emit('data', template('conflict', {
    name: name,
    requirements: requirements,
    json: config.json,
    versions: versions.slice(0, -1).join(', ') + ' or ' + versions[versions.length - 1]
  }, true));
};

Manager.prototype.reportForceblyResolved = function (name, packages) {
  var requirements = [];

  packages = packages.filter(function (pkg) { return !!pkg.version; });
  packages.forEach(function (pkg) {
    requirements.push({ pkg: pkg, tag: pkg.originalTag || '~' + pkg.version });
  });

  this.emit('data', template('resolved-conflict', {
    name: name,
    requirements: requirements,
    json: config.json,
    resolvedTo: packages[0].version,
    forceLatest: this.opts.forceLatest
  }, true));
};


// ----- list ----- //

// Used in list command
// TODO: not sure if this belongs here.. maybe move it to the list command?
Manager.prototype.list = function (options) {
  options = options || {};
   // If the user passed the paths or map options, we don't need to fetch versions
  this._isCheckingVersions = !options.offline && !options.paths && !options.map && options.argv;
  this.once('resolveLocal', this.getDependencyList.bind(this))
    .resolveLocal();
};

Manager.prototype.getDependencyList = function () {

  var packages = {};
  var values;
  var checkVersions = this._isCheckingVersions;

  Object.keys(this.dependencies).forEach(function (key) {
    packages[key] = this.dependencies[key][0];
  }.bind(this));

  values = _.values(packages);

  // Do not proceed if no values
  if (!values.length) {
    return packages;
  }

  if (checkVersions) {
    template('action', { name: 'discover', shizzle: 'Please wait while newer package versions are being discovered' })
      .on('data', this.emit.bind(this, 'data'));
  }

  // Load JSON and get version for each package
  async.forEach(values, function (pkg, next) {
    pkg.once('loadJSON', function () {
      // Only check versions if not offline and it's a repo
      var fetchVersions = checkVersions &&
                          pkg.json.repository &&
                          (pkg.json.repository.type === 'git' || pkg.json.repository.type === 'local-repo');

      if (fetchVersions) {
        pkg.once('versions', function (versions) {
          pkg.tags = versions.map(function (ver) {
            return semver.valid(ver) ? semver.clean(ver) : ver;
          });
          next();
        }).versions();
      } else {
        pkg.tags = [];
        next();
      }
    }).loadJSON();
  }.bind(this), this.emit.bind(this, 'list', packages));
};

module.exports = Manager;
