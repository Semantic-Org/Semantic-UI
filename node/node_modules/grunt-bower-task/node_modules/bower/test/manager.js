/*jshint plusplus:false*/

var assert  = require('assert');
var Manager = require('../lib/core/manager');
var rimraf  = require('rimraf');
var config  = require('../lib/core/config');
var semver  = require('semver');
var fs      = require('fs');
var path    = require('path');

describe('manager', function () {
  var savedConfigJson = config.json;

  function clean(done) {
    // Restore possibly dirtied config.json
    config.json = savedConfigJson;

    var del = 0;

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
  after(clean);

  it('Should resolve JSON dependencies', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project';

    manager.on('resolve', function () {
      assert.ok(semver.gte(manager.dependencies.jquery[0].version, '1.8.1'));
      assert.ok(semver.gte(manager.dependencies['package-bootstrap'][0].version, '2.0.0'));
      assert.ok(semver.gte(manager.dependencies['jquery-ui'][0].version, '1.8.0'));
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should resolve nested JSON dependencies', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-nested';

    manager.on('resolve', function () {
      assert.deepEqual(manager.dependencies.jquery[0].version, '1.7.2');
      assert.deepEqual(manager.dependencies['jquery-pjax'][0].version, '1.0.0');
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should resolve nested JSON dependencies even when using another name for bower.json project-wise', function (next) {
    // Using another name for .json file leads to unfetchable deps
    // https://github.com/twitter/bower/issues/205
    config.json = 'foocomponent.json';
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-nonstandard-json';

    manager.on('resolve', function () {
      assert.deepEqual(manager.dependencies['jquery-pjax'][0].version, '1.0.0');
      assert.notEqual(manager.dependencies.jquery[0].version, null);
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should fallback to component.json if not overriden and bower.json does not exist', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-old';

    manager.on('resolve', function () {
      assert.deepEqual(manager.dependencies['jquery-pjax'][0].version, '1.0.0');
      assert.notEqual(manager.dependencies.jquery[0].version, null);
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should emit a warning when falling back to component.json', function (next) {
    var manager = new Manager([]);
    var warning = '';
    manager.cwd = __dirname + '/assets/project-old';

    manager.on('resolve', function () {
      assert(/deprecated "component.json"/.test(warning));
      next();
    });

    manager.on('warn', function (message) {
      warning = message;
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should override packages at the project level', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-static';

    manager.on('resolve', function () {
      assert.deepEqual(manager.dependencies.jquery[0].version, '1.8.1');
      assert.ok(fs.existsSync(path.join(manager.dependencies.jquery[0].localPath, 'foo.js')));
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should not error out in resolved conflicts', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-nested';

    manager.on('error', function (err) {
      throw err;
    });
    manager.on('resolve', function () {
      assert.deepEqual(manager.dependencies.jquery[0].version, '1.7.2');
      next();
    });

    manager.resolve();
  });

  it('Should detect unresolvable packages in nested JSON dependencies', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-nested-conflict';

    var detected = false;
    manager.on('error', function () {
      if (/no resolvable.* jquery$/i) detected = true;
    });
    manager.on('resolve', function () {
      if (!detected) throw new Error('A conflict in jquery should have been detected.');
      next();
    });

    manager.resolve();
  });

  it('Should resolve to latest version on unresolvable packages in nested JSON dependencies', function (next) {
    var manager = new Manager([], { forceLatest: true });
    manager.cwd = __dirname + '/assets/project-nested-conflict';

    manager.on('error', function (err) {
      throw err;
    });
    manager.on('resolve', function () {
      assert.ok(semver.gte(manager.dependencies.jquery[0].version, '1.7.0'));
      next();
    });

    manager.resolve();
  });

  it('Should fetch remote sources if the force option is passed', function (next) {
    this.timeout(40000);  // Increase the timeout because this one takes longer

    function resolve() {
      var manager = new Manager([], { force: true });
      manager.cwd = __dirname + '/assets/project';

      manager.on('error', function (err) {
        throw err;
      });

      manager.resolve();

      return manager;
    }

    // We install the same package two times
    var pkg = resolve();
    var nrCached = 0;
    pkg.on('resolve', function () {
      // We got the cache filled in at this time
      // This project has only a shared dependency (jquery) so it will be erased the first time
      // but cached the second time
      pkg = resolve();

      pkg.on('data', function (data) {
        if (/cached/.test(data)) nrCached++;
      });

      pkg.on('resolve', function () {
        if (nrCached > 1) throw new Error('Cached versions are being used.');
        next();
      });
    });
  });

  it('Should resolve devDependencies by default', function (next) {
    var manager = new Manager([]);
    manager.cwd = __dirname + '/assets/project-dev-deps';

    manager.on('resolve', function () {
      assert.ok(manager.dependencies.jquery);
      assert.ok(manager.dependencies['package-dev-dep']);
      assert.ok(manager.dependencies.bootstrap);
      assert.ok(manager.dependencies.turtles);
      // no devDependencies of dependencies
      assert.ok(!manager.dependencies.qunit);
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

  it('Should not resolve devDependencies when specified', function (next) {
    var manager = new Manager([], { production: true });
    manager.cwd = __dirname + '/assets/project-dev-deps';

    manager.on('resolve', function () {
      assert.ok(manager.dependencies.jquery);
      assert.ok(!manager.dependencies.bootstrap);
      assert.ok(!manager.dependencies.turtles);
      next();
    });

    manager.on('error', function (err) {
      throw err;
    });

    manager.resolve();
  });

});
