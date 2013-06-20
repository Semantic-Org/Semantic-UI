/*jshint plusplus:false*/

var assert  = require('assert');
var fs      = require('fs');
var path    = require('path');
var nock    = require('nock');
var _       = require('lodash');
var rimraf  = require('rimraf');
var glob    = require('glob');
var async   = require('async');
var config  = require('../lib/core/config');
var Package = require('../lib/core/package');

describe('package', function () {
  var savedConfigJson = config.json;
  var savedConfigShorthandResolver = config.shorthand_resolver;

  function clean(done) {
    var del = 0;

    // Restore possibly dirtied config.json
    config.json = savedConfigJson;

    // Restore possibly dirtied config.shorthand_resolver
    config.shorthand_resolver = savedConfigShorthandResolver;

    rimraf(config.directory, function (err) {
      if (err) throw new Error('Unable to remove components directory');
      if (++del >= 2) done();
    });

    rimraf(config.cache, function (err) {
      if (err) throw new Error('Unable to remove cache directory');
      if (++del >= 2) done();
    });
  }

  beforeEach(clean);
  after(function (done) {
    nock.cleanAll();
    clean(done);
  });

  it('Should resolve git URLs properly', function () {
    var pkg = new Package('jquery', 'git://github.com/jquery/jquery.git');
    assert.equal(pkg.gitUrl, 'git://github.com/jquery/jquery.git');
  });

  it('Should resolve git shorthands (username/project)', function () {
    var pkg = new Package('jquery', 'jquery/jquery');
    assert.equal(pkg.gitUrl, 'git://github.com/jquery/jquery.git');
  });

  it('Should resolve git shorthands (username/project) with specific tag', function () {
    var pkg = new Package('jquery', 'jquery/jquery#1.0.0');
    assert.equal(pkg.gitUrl, 'git://github.com/jquery/jquery.git');
    assert.equal(pkg.tag, '1.0.0');
  });

  it('Should resolve git shorthand template (username/project) containing {{{ endpoint }}}', function () {
    config.shorthand_resolver = 'git://example.com/{{{ endpoint }}}.git';
    var pkg = new Package('jquery', 'jquery/jquery');
    assert.equal(pkg.gitUrl, 'git://example.com/jquery/jquery.git');
  });

  it('Should resolve git shorthand template (username/project) containing {{{ endpoint }}} with specific tag ', function () {
    config.shorthand_resolver = 'git://example.com/{{{ endpoint }}}.git';
    var pkg = new Package('jquery', 'jquery/jquery#1.0.0');
    assert.equal(pkg.gitUrl, 'git://example.com/jquery/jquery.git');
    assert.equal(pkg.tag, '1.0.0');
  });

  it('Should resolve git shorthand template (username/project) containing {{{ organization }}} {{{ package }}}', function () {
    config.shorthand_resolver = 'git://example.com/{{{ organization }}}/{{{ package }}}.git';
    var pkg = new Package('jquery', 'jquery/jquery');
    assert.equal(pkg.gitUrl, 'git://example.com/jquery/jquery.git');
  });

  it('Should resolve git shorthand template (username/project) containing {{{ organization }}} {{{ package }}} with specific tag ', function () {
    config.shorthand_resolver = 'git://example.com/{{{ organization }}}/{{{ package }}}.git';
    var pkg = new Package('jquery', 'jquery/jquery#1.0.0');
    assert.equal(pkg.gitUrl, 'git://example.com/jquery/jquery.git');
    assert.equal(pkg.tag, '1.0.0');
  });

  it('Should resolve git HTTP URLs properly', function () {
    var pkg = new Package('jquery', 'git+http://example.com/project.git');
    assert.equal(pkg.gitUrl, 'http://example.com/project.git');
  });

  it('Should resolve git HTTPS URLs properly', function () {
    var pkg = new Package('jquery', 'git+https://example.com/project.git');
    assert.equal(pkg.gitUrl, 'https://example.com/project.git');
  });

  it('Should resolve git URL tags', function () {
    var pkg = new Package('jquery', 'git://github.com/jquery/jquery.git#v1.0.1');
    assert.equal(pkg.tag, 'v1.0.1');
  });

  it('Should resolve github urls', function () {
    var pkg = new Package('jquery', 'git@github.com:twitter/flight.git#v1.0.1');
    assert.equal(pkg.tag, 'v1.0.1');
    assert.equal(pkg.gitUrl, 'git@github.com:twitter/flight.git');
  });

  it('Should resolve normal HTTP URLs', function (next) {
    var pkg = new Package('bootstrap', 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js');

    pkg.on('resolve', function () {
      assert(pkg.assetUrl);
      assert.equal(pkg.assetUrl, 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js');
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should resolve url when we got redirected', function (next) {
    var redirecting_url    = 'http://redirecting-url.com';
    var redirecting_to_url = 'http://redirected-to-url.com';

    nock(redirecting_url)
      .defaultReplyHeaders({'location': redirecting_to_url + '/jquery.js'})
      .get('/jquery.js')
      .reply(302);

    nock(redirecting_to_url)
      .get('/jquery.js')
      .reply(200, 'jquery content');

    var pkg = new Package('jquery', redirecting_url + '/jquery.js');

    pkg.on('resolve', function () {
      assert(pkg.assetUrl);
      assert.equal(pkg.assetUrl, redirecting_to_url + '/jquery.js');
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should error if the HTTP status is not OK', function (next) {
    var pkg = new Package('test', 'http://somedomainthatwillneverexistbower.com/test.js');

    pkg.on('resolve', function () {
      throw new Error('Should have given an error');
    });

    pkg.on('error', function () {
      next();
    });

    pkg.resolve();
  });

  it('Should clone git packages', function (next) {
    var pkg = new Package('jquery', 'git://github.com/maccman/package-jquery.git');

    pkg.on('resolve', function () {
      assert(pkg.path);
      assert(fs.existsSync(pkg.path));
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });


  it('Should error on clone fail', function (next) {
    var pkg = new Package('random', 'git://example.com');

    pkg.on('error', function (err) {
      assert(err);
      next();
    });

    pkg.resolve();
  });

  it('Should copy path packages', function (next) {
    var pkg = new Package('jquery', __dirname + '/assets/package-jquery');

    pkg.on('resolve', function () {
      assert(pkg.path);
      assert(fs.existsSync(pkg.path));
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should load configured json file package-wise', function (next) {
    var pkg = new Package('mypackage', __dirname + '/assets/package-nonstandard-json');

    pkg.on('loadJSON', function () {
      assert(pkg.json);
      assert.equal(pkg.json.name, 'mypackage');
      assert.equal(pkg.json.version, '1.0.0');
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.loadJSON();
  });

  it('Should load configured json file project-wise if not defined package-wise', function (next) {
    config.json = 'foocomponent.json';
    var pkg = new Package('mypackage', __dirname + '/assets/package-nonstandard-json-copy');

    pkg.on('loadJSON', function () {
      assert(pkg.json);
      assert.equal(pkg.json.name, 'mypackage');
      assert.equal(pkg.json.version, '1.0.0');

      // Test the same but with a package that has a .bowerrc but does not specify a different json
      pkg = new Package('mypackage', __dirname + '/assets/package-empty-rc');

      pkg.on('loadJSON', function () {
        assert(pkg.json);
        assert.equal(pkg.json.name, 'mypackage-foo');
        assert.equal(pkg.json.version, '1.0.0');

        next();
      });

      pkg.on('error', function (err) {
        throw err;
      });

      pkg.loadJSON();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.loadJSON();
  });

  it('Should fallback to bower.json if the json project-wise does not exist', function (next) {
    config.json = 'foocomponent.json';
    var pkg = new Package('jquery', __dirname + '/assets/package-jquery');

    pkg.on('loadJSON', function () {
      assert(pkg.json);
      assert.equal(pkg.json.name, 'jquery');
      assert.equal(pkg.json.version, '1.8.1');
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.loadJSON();
  });

  it('Should fallback to bower.json if not defined project wise and package-wise', function (next) {
    var pkg = new Package('jquery', __dirname + '/assets/package-jquery');

    pkg.on('loadJSON', function () {
      assert(pkg.json);
      assert.equal(pkg.json.name, 'jquery');
      assert.equal(pkg.json.version, '1.8.1');

      // Test the same but with a package that has a .bowerrc but does not specify a different json
      pkg = new Package('jquery', __dirname + '/assets/package-empty-rc');

      pkg.on('loadJSON', function () {
        assert(pkg.json);
        assert.equal(pkg.json.name, 'mypackage');
        assert.equal(pkg.json.version, '1.0.0');

        // Test the same but with a package that has a .bowerrc but does not specify a different json
        next();
      });

      pkg.on('error', function (err) {
        throw err;
      });

      pkg.loadJSON();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.loadJSON();
  });

  it('Should correct guessed name with configured json file package-wise', function (next) {
    var pkg = new Package(null, __dirname + '/assets/package-jquery');

    pkg.on('loadJSON', function () {
      assert(pkg.json);
      assert.equal(pkg.name, 'jquery');
      assert.equal(pkg.json.name, 'jquery');
      assert.equal(pkg.json.version, '1.8.1');
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.loadJSON();
  });

  it('Should give an error on an invalid bower.json', function (next) {
    var pkg = new Package('jquery', __dirname + '/assets/package-invalid-json');

    pkg.on('error', function (error) {
      if (/parse json/i.test(error)) next();
      else throw new Error(error);
    });
    pkg.on('loadJSON', function () {
      throw new Error('Should have throw an error parsing the JSON.');
    });

    pkg.loadJSON();
  });

  it('Should resolve JSON dependencies', function (next) {
    var pkg = new Package('project', __dirname + '/assets/project');

    pkg.on('resolve', function () {
      var deps = _.pluck(pkg.getDeepDependencies(), 'name');
      assert.deepEqual(_.uniq(deps), ['jquery', 'package-bootstrap', 'jquery-ui']);
      next();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should error when copying fails from non existing path', function (next) {
    var pkg = new Package('project', __dirname + '/assets/project-non-existent');

    pkg.on('error', function (err) {
      assert(err);
      next();
    });

    pkg.resolve();
  });

  it('Should copy files from temp folder to local path', function (next) {
    var pkg = new Package('jquery', 'git://github.com/maccman/package-jquery.git');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      assert(fs.existsSync(pkg.localPath));
      next();
    });

    pkg.resolve();
  });


  it('Should treat local packages as git repositories if there is a .git', function (next) {
    var dir = __dirname + '/assets/package-repo';

    fs.renameSync(dir + '/git_repo', dir + '/.git');

    var pkg = new Package('spark-md5', dir);

    pkg.on('resolve', function () {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      assert(fs.existsSync(pkg.path + '/spark-md5.js'));
      assert(fs.existsSync(pkg.path + '/spark-md5.min.js'));
      assert(fs.existsSync(pkg.path + '/.jshintrc'));
      next();
    });

    pkg.on('error', function (err) {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      throw err;
    });

    pkg.resolve();
  });

  it('Should treat local packages as git repositories if there is a .git (and handle versions)', function (next) {
    var dir = __dirname + '/assets/package-repo';

    fs.renameSync(dir + '/git_repo', dir + '/.git');

    var pkg = new Package('spark-md5', dir + '#0.0.1');

    pkg.on('resolve', function () {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      assert(fs.existsSync(pkg.path + '/spark-md5.js'));
      assert(fs.existsSync(pkg.path + '/spark-md5.min.js'));
      assert(fs.existsSync(pkg.path + '/.jshintrc') === false);
      next();
    });

    pkg.on('error', function (err) {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      throw err;
    });

    pkg.resolve();
  });

  it('Should have accessible file permissions', function (next) {
    var pkg = new Package('jquery', 'git://github.com/maccman/package-jquery.git');
    var cachePath;

    pkg.on('cache', function () {
      cachePath = pkg.path;
    });

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      async.map([pkg.localPath, cachePath], fs.stat, function (err, results) {
        if (err) throw err;
        var mode0777 = parseInt('0777', 8);
        var expectedMode = mode0777 & (~process.umask());
        assert.equal(results[0].mode, results[1].mode);
        assert((results[0].mode & expectedMode) === expectedMode || results[0].mode === 16822);  // 16822 is for windows
        next();
      });
    });

    pkg.resolve();
  });

  it('Should have accessible file permissions for downloaded files', function (next) {
    nock('http://someawesomedomain.com')
      .get('/package.zip')
      .reply(200, fs.readFileSync(__dirname + '/assets/package-zip.zip'));

    var pkg = new Package('bootstrap', 'http://someawesomedomain.com/package.zip');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      fs.stat(pkg.localPath, function (err, stat) {
        if (err) throw err;
        var mode0777 = parseInt('0777', 8);
        var expectedMode = mode0777 & (~process.umask());
        assert((stat.mode & expectedMode) === expectedMode || stat.mode === 16822);  // 16822 is for windows
        next();
      });
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should download normal URL packages', function (next) {
    var pkg = new Package('jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      fs.readdir(pkg.localPath, function (err, files) {
        if (err) throw err;

        assert(files.indexOf('index.js') !== -1);
        next();
      });
    });

    pkg.resolve();
  });

  it('Should extract tar and zip files from normal URL packages', function (next) {
    nock('http://someawesomedomain.com')
      .get('/package.zip')
      .reply(200, fs.readFileSync(__dirname + '/assets/package-zip.zip'));

    var pkg = new Package('bootstrap', 'http://someawesomedomain.com/package.zip');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      fs.readdir(pkg.localPath, function (err, files) {
        if (err) throw err;

        assert(files.indexOf('index.js') === -1);
        assert(files.indexOf('package.zip') === -1);
        assert(files.indexOf('foo.js') !== -1);
        next();
      });
    });

    pkg.resolve();
  });

  it('Should extract tar and zip files from normal URL packages and move them if the archive only contains a folder', function (next) {
    nock('http://someawesomedomain.com')
      .get('/package-folder.zip')
      .reply(200, fs.readFileSync(__dirname + '/assets/package-zip-folder.zip'));

    var pkg = new Package('bootstrap', 'http://someawesomedomain.com/package-folder.zip');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.on('install', function () {
      fs.readdir(pkg.localPath, function (err, files) {
        if (err) throw err;

        assert(files.indexOf('index.js') === -1);
        assert(files.indexOf('package-folder.zip') === -1);
        assert(files.indexOf('foo.js') !== -1);
        next();
      });
    });

    pkg.resolve();
  });

  it('Should remove ignored filepaths', function (next) {
    var pkg = new Package('turtles', __dirname + '/assets/package-ignorables');

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      throw new Error(err);
    });

    var pkgInstallPath = path.join(__dirname, '/../components/turtles/');
    pkg.on('install', function () {
      // these files should have been deleted
      assert(!fs.existsSync(pkgInstallPath + 'don.txt'));
      assert(!fs.existsSync(pkgInstallPath + 'leo.txt'));
      assert(!fs.existsSync(pkgInstallPath + '/test/'));
      // ignored dot files
      assert(!fs.existsSync(pkgInstallPath + '/config/.jshintrc'));
      assert(!fs.existsSync(pkgInstallPath + '.casey'));
      assert(!fs.existsSync(pkgInstallPath + '.hide/turtle-location.mdown'));
      // this file should still be there
      assert(fs.existsSync(pkgInstallPath + 'index.js'));
      // all ignore file pattern should be removed
      async.forEach(pkg.json.ignore, function (ignorePattern, asyncNext) {
        var pattern = path.join(__dirname, '/../components/turtles/' + ignorePattern);
        glob(pattern, function (err, globPath) {
          assert(globPath.length === 0);
          asyncNext();
        });
      }, next);
    });

    pkg.resolve();
  });

  it('Should remove .git directory', function (next) {
    var dir = __dirname + '/assets/package-repo';

    fs.renameSync(dir + '/git_repo', dir + '/.git');

    var pkg = new Package('spark-md5', dir);

    pkg.on('resolve', function () {
      pkg.install();
    });

    pkg.on('error', function (err) {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      throw new Error(err);
    });

    var pkgInstallPath = path.join(__dirname, '/../components/spark-md5/');
    pkg.on('install', function () {
      fs.renameSync(dir + '/.git', dir + '/git_repo');
      assert(!fs.existsSync(pkgInstallPath + '/.git/'));
      next();
    });

    pkg.resolve();
  });

  it('Should display a warning if a dependency is using the old component.json file', function (next) {
    var pkg = new Package('project', __dirname + '/assets/project');
    var warn = [];

    pkg.on('resolve', function () {
      assert.equal(warn.length, 3);
      next();
    });

    pkg.on('warn', function (message) {
      if (/deprecated "component.json"/.test(message)) {
        warn.push(message);
      }
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });

  it('Should not display a warning for dependencies using the new bower.json file', function (next) {
    var pkg = new Package('project-new-deps', __dirname + '/assets/project-new-deps');
    var warn = [];

    pkg.on('resolve', function () {
      assert.equal(warn.length, 0);
      next();
    });

    pkg.on('warn', function (message) {
      if (/deprecated "component.json"/.test(message)) {
        warn.push(message);
      }
    });

    pkg.on('error', function (err) {
      throw err;
    });

    pkg.resolve();
  });
});
