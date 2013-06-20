/*jshint plusplus:false*/

var glob       = require('glob');
var assert     = require('assert');
var rimraf     = require('rimraf');
var path       = require('path');
var fs         = require('fs');
var mkdirp     = require('mkdirp');
var config     = require('../lib/core/config');
var cacheClean = require('../lib/commands/cache-clean');

describe('cache-clean', function () {
  function clean(done) {
    var del = 0;

    rimraf(config.cache, function (err) {
      if (err) throw new Error('Unable to remove cache directory');
      if (++del >= 3) createDirs(done);
    });

    rimraf(config.links, function (err) {
      if (err) throw new Error('Unable to remove links directory');
      if (++del >= 3) createDirs(done);
    });

    rimraf(__dirname + '/temp', function (err) {
      if (err) throw new Error('Unable to remove temp directory');
      if (++del >= 3) createDirs(done);
    });
  }

  beforeEach(function (done) {
    clean(function (err) {
      if (err) return done(err);
      fs.mkdirSync(__dirname + '/temp');
      done();
    });
  });
  after(clean);

  function createDirs(done) {
    mkdirp(config.cache, function (err) {
      if (err) return done(new Error('Unable to create cache directory'));

      mkdirp(config.links, function (err) {
        if (err) return done(new Error('Unable to create links directory'));
        done();
      });
    });
  }

  function simulatePackage(name) {
    // Create some stuff in the cache to simulate
    var dir = path.join(config.cache, name);
    var someDir = path.join(dir, 'some-dir');

    fs.mkdirSync(dir);
    fs.mkdirSync(someDir);
    fs.writeFileSync(path.join(dir, 'some-file'), 'bower is awesome');
    fs.writeFileSync(path.join(someDir, 'some-other-file'), 'bower is fantastic');
  }

  function simulateLink(name, linkedPath) {
    var dir = path.join(config.links, name);
    fs.mkdirSync(linkedPath);
    fs.symlinkSync(linkedPath, dir);
  }

  it('Should emit end event', function (next) {
    simulatePackage('some-package');

    var cleaner = cacheClean();

    cleaner
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        next();
      });
  });

  it('Should clean the entire cache', function (next) {
    simulatePackage('some-package');
    simulatePackage('other-package');
    simulateLink('linked-package', __dirname + '/temp/linked-package');
    fs.rmdirSync(__dirname + '/temp/linked-package'); // simulate invalid symlinks
    simulateLink('linked-package2', __dirname + '/temp/linked-package2');

    var cleaner = cacheClean();

    cleaner.on('error', function (err) {
      throw err;
    });

    cleaner.on('end', function () {
      glob(config.cache + '/*', function (err, dirs) {
        if (err) throw err;
        assert(dirs.length === 0);

        glob(config.links + '/*', function (err, dirs) {
          if (err) throw err;

          dirs = dirs.map(function (dir) {
            return path.basename(dir);
          });

          assert(dirs.length === 1);
          assert.deepEqual(dirs, ['linked-package2']);

          next();
        });
      });
    });
  });

  it('Should clean only the selected packages', function (next) {
    simulatePackage('foo-package');
    simulatePackage('bar-package');
    simulatePackage('baz-package');

    var cleaner = cacheClean(['foo-package', 'bar-package']);

    cleaner.on('error', function (err) {
      throw err;
    });

    cleaner.on('end', function () {
      glob(config.cache + '/*', function (err, dirs) {
        if (err) throw err;
        dirs = dirs.map(function (dir) {
          return path.basename(dir);
        });

        assert.deepEqual(dirs, ['baz-package']);
        next();
      });
    });
  });

  it('Should clean only the selected links', function (next) {
    simulateLink('linked-package', __dirname + '/temp/linked-package');
    fs.rmdirSync(__dirname + '/temp/linked-package'); // simulate invalid symlinks
    simulateLink('linked-package2', __dirname + '/temp/linked-package2');
    fs.rmdirSync(__dirname + '/temp/linked-package2'); // simulate invalid symlinks

    var cleaner = cacheClean(['linked-package']);

    cleaner.on('error', function (err) {
      throw err;
    });

    cleaner.on('end', function () {
      glob(config.links + '/*', function (err, dirs) {
        if (err) throw err;
        dirs = dirs.map(function (dir) {
          return path.basename(dir);
        });

        assert.deepEqual(dirs, ['linked-package2']);
        next();
      });
    });
  });

  it('Should handle passing duplicate package names', function (next) {
    simulatePackage('foo-package');
    simulatePackage('bar-package');

    var cleaner = cacheClean(['foo-package', 'foo-package', 'bar-package']);

    cleaner.on('error', function (err) {
      throw err;
    });

    cleaner.on('end', function () {
      glob(config.cache + '/*', function (err, dirs) {
        if (err) throw err;
        assert(dirs.length === 0);
        next();
      });
    });
  });

});