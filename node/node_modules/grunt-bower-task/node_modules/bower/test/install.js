/*jshint plusplus:false*/

var assert  = require('assert');
var fs      = require('fs');
var path    = require('path');
var rimraf  = require('rimraf');

var _       = require('lodash');

var config  = require('../lib/core/config.js');
var install = require('../lib/commands/install');

describe('install', function () {
  var cwd = process.cwd();
  var testDir = __dirname + '/install_test';

  function clean(done) {
    var del = 0;

    rimraf(testDir, function (err) {
      if (err) throw new Error('Unable to remove test directory');
      if (++del >= 3) done();
    });

    rimraf(config.directory, function (err) {
      if (err) throw new Error('Unable to remove components directory');
      if (++del >= 3) done();
    });

    rimraf(config.cache, function (err) {
      if (err) throw new Error('Unable to remove cache directory');
      if (++del >= 3) done();
    });
  }

  beforeEach(function (done) {
    process.chdir(cwd);
    clean(done);
  });
  after(function (done) {
    process.chdir(cwd);
    clean(done);
  });

  it('Should have line method', function () {
    assert(!!install.line);
  });

  it('Should emit end event', function (done) {
    var dir = __dirname + '/assets/project';
    process.chdir(dir);

    install()
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(dir, config.directory, 'jquery')));
        assert(fs.existsSync(path.join(dir, config.directory, 'package-bootstrap')));
        assert(fs.existsSync(path.join(dir, config.directory, 'jquery-ui')));
        done();
      });
  });

  it('Should save dependencies to the json', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    install(['jquery'], { save: true })
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(testDir, config.directory, 'jquery')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.dependencies);
        assert.equal(_.size(json.dependencies), 1);
        assert(typeof json.dependencies.jquery === 'string');
        assert(!json.devDependencies);
        done();
      });
  });

  it('Should save devDependencies to the json', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    var opts = {};
    opts['save-dev'] = true;

    install(['jquery'], opts)
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(testDir, config.directory, 'jquery')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.devDependencies);
        assert.equal(_.size(json.devDependencies), 1);
        assert(typeof json.devDependencies.jquery === 'string');
        assert(!json.dependencies);
        done();
      });
  });

  it('Should save dependencies to the json and not mess with it if already exists', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
      name: 'some-package',
      version: '0.0.0',
      dependencies: {
        'jquery': '*'
      },
      devDependencies: {
        'async': '*'
      }
    }));

    install(['mout'], { save: true })
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(testDir, config.directory, 'mout')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.dependencies);
        assert.equal(_.size(json.dependencies), 2);
        assert.equal(json.dependencies.jquery, '*');
        assert(typeof json.dependencies.mout === 'string');
        assert(json.devDependencies);
        assert.equal(_.size(json.devDependencies), 1);
        assert.equal(json.devDependencies.async, '*');
        done();
      });
  });

  it.skip('should save an URL to the json even if a redirect occurs');

  it('Should save devDependencies to the json', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    var opts = {};
    opts['save-dev'] = true;

    install(['jquery'], opts)
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(testDir, config.directory, 'jquery')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.devDependencies);
        assert.equal(_.size(json.devDependencies), 1);
        assert(typeof json.devDependencies.jquery === 'string');
        assert(!json.dependencies);
        done();
      });
  });

  it('Should save devDependencies to the json and not mess with it if already exists', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    var opts = {};
    opts['save-dev'] = true;

    fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
      name: 'some-package',
      version: '0.0.0',
      dependencies: {
        'jquery': '*'
      },
      devDependencies: {
        'async': '*'
      }
    }));

    install(['mout'], opts)
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        assert(fs.existsSync(path.join(testDir, config.directory, 'mout')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.dependencies);
        assert.equal(_.size(json.dependencies), 1);
        assert.equal(json.dependencies.jquery, '*');
        assert(json.devDependencies);
        assert.equal(_.size(json.devDependencies), 2);
        assert.equal(json.devDependencies.async, '*');
        assert(typeof json.devDependencies.mout === 'string');
        done();
      });
  });

  it('Should not save dependencies to the json if command failed', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
      name: 'some-package',
      version: '0.0.0',
      dependencies: {
        'jquery': '*'
      }
    }));

    install(['packagethatwillneverexist'], { save: true })
      .on('error', function () {})
      .on('end', function () {
        assert(!fs.existsSync(path.join(testDir, config.directory, 'packagethatwillneverexist')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.dependencies);
        assert.equal(_.size(json.dependencies), 1);
        assert(typeof json.dependencies.jquery === 'string');
        assert(!json.dependencies.packagethatwillneverexist);
        assert(!json.devDependencies);

        fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
          name: 'some-package',
          version: '0.0.0',
          devDependencies: {
            'jquery': '*'
          }
        }));

        install(['packagethatwillneverexist'], { save: true })
          .on('error', function () {})
          .on('end', function () {
            assert(!fs.existsSync(path.join(testDir, config.directory, 'packagethatwillneverexist')));

            var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
            assert(!json.dependencies);
            assert(json.devDependencies);
            assert.equal(_.size(json.devDependencies), 1);
            assert(typeof json.devDependencies.jquery === 'string');
            done();
          });
      });
  });

  it('Should not save devDependencies to the json if command failed', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    var opts = {};
    opts['save-dev'] = true;

    fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
      name: 'some-package',
      version: '0.0.0',
      devDependencies: {
        'jquery': '*'
      }
    }));

    install(['packagethatwillneverexist'], opts)
      .on('error', function () {})
      .on('end', function () {
        assert(!fs.existsSync(path.join(testDir, config.directory, 'packagethatwillneverexist')));

        var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
        assert(json.devDependencies);
        assert.equal(_.size(json.devDependencies), 1);
        assert(typeof json.devDependencies.jquery === 'string');
        assert(!json.devDependencies.packagethatwillneverexist);
        assert(!json.dependencies);

        fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
          name: 'some-package',
          version: '0.0.0',
          dependencies: {
            'jquery': '*'
          }
        }));

        install(['packagethatwillneverexist'], opts)
          .on('error', function () {})
          .on('end', function () {
            assert(!fs.existsSync(path.join(testDir, config.directory, 'packagethatwillneverexist')));

            var json = JSON.parse(fs.readFileSync(path.join(testDir, config.json)));
            assert(!json.devDependencies);
            assert(json.dependencies);
            assert.equal(_.size(json.dependencies), 1);
            assert(typeof json.dependencies.jquery === 'string');
            done();
          });
      });
  });

  it('Should preserve new line at the end of the file', function (done) {
    fs.mkdirSync(testDir);
    process.chdir(testDir);

    fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
      name: 'some-package',
      version: '0.0.0'
    }) + '\n');

    install(['jquery'], { save: true })
      .on('error', function (err) {
        throw err;
      })
      .on('end', function () {
        var contents = fs.readFileSync(path.join(testDir, config.json)).toString();
        var json = JSON.parse(contents);
        assert(!json.devDependencies);
        assert(json.dependencies);
        assert.equal(_.size(json.dependencies), 1);
        assert(typeof json.dependencies.jquery === 'string');
        assert(contents.slice(-1) === '\n');

        fs.writeFileSync(path.join(testDir, config.json), JSON.stringify({
          name: 'some-package',
          version: '0.0.0'
        }));

        install(['jquery'], { save: true })
          .on('error', function (err) {
            throw err;
          })
          .on('end', function () {
            var contents = fs.readFileSync(path.join(testDir, config.json)).toString();
            assert(contents.slice(-1) !== '\n');
            done();
          });
      });
  });
});