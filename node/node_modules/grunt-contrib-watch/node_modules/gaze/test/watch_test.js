'use strict';

var gaze = require('../lib/gaze.js');
var grunt = require('grunt');
var path = require('path');
var fs = require('fs');

// Node v0.6 compat
fs.existsSync = fs.existsSync || path.existsSync;

// Clean up helper to call in setUp and tearDown
function cleanUp(done) {
  [
    'sub/tmp.js',
    'sub/tmp',
    'sub/renamed.js',
    'added.js',
    'nested/added.js',
    'nested/.tmp',
    'nested/sub/added.js'
  ].forEach(function(d) {
    var p = path.resolve(__dirname, 'fixtures', d);
    if (fs.existsSync(p)) { fs.unlinkSync(p); }
  });
  done();
}

exports.watch = {
  setUp: function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures'));
    cleanUp(done);
  },
  tearDown: cleanUp,
  remove: function(test) {
    test.expect(2);
    gaze('**/*', function() {
      this.remove(path.resolve(__dirname, 'fixtures', 'sub', 'two.js'));
      this.remove(path.resolve(__dirname, 'fixtures'));
      var result = this.relative(null, true);
      test.deepEqual(result['sub/'], ['one.js']);
      test.notDeepEqual(result['.'], ['one.js']);
      this.close();
      test.done();
    });
  },
  changed: function(test) {
    test.expect(1);
    gaze('**/*', function(err, watcher) {
      watcher.on('changed', function(filepath) {
        var expected = path.relative(process.cwd(), filepath);
        test.equal(path.join('sub', 'one.js'), expected);
        watcher.close();
      });
      this.on('added', function() { test.ok(false, 'added event should not have emitted.'); });
      this.on('deleted', function() { test.ok(false, 'deleted event should not have emitted.'); });
      fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'), 'var one = true;');
      watcher.on('end', test.done);
    });
  },
  added: function(test) {
    test.expect(1);
    gaze('**/*', function(err, watcher) {
      watcher.on('added', function(filepath) {
        var expected = path.relative(process.cwd(), filepath);
        test.equal(path.join('sub', 'tmp.js'), expected);
        watcher.close();
      });
      this.on('changed', function() { test.ok(false, 'changed event should not have emitted.'); });
      this.on('deleted', function() { test.ok(false, 'deleted event should not have emitted.'); });
      fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'tmp.js'), 'var tmp = true;');
      watcher.on('end', test.done);
    });
  },
  dontAddUnmatchedFiles: function(test) {
    test.expect(2);
    gaze('**/*.js', function(err, watcher) {
      setTimeout(function() {
        test.ok(true, 'Ended without adding a file.');
        watcher.close();
      }, 1000);
      this.on('added', function(filepath) {
        test.equal(path.relative(process.cwd(), filepath), path.join('sub', 'tmp.js'));
      });
      fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'tmp'), 'Dont add me!');
      fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'tmp.js'), 'add me!');
      watcher.on('end', test.done);
    });
  },
  dontAddMatchedDirectoriesThatArentReallyAdded: function(test) {
    // This is a regression test for a bug I ran into where a matching directory would be reported
    // added when a non-matching file was created along side it.  This only happens if the
    // directory name doesn't occur in $PWD.
    test.expect(1);
    gaze('**/*', function(err, watcher) {
      setTimeout(function() {
        test.ok(true, 'Ended without adding a file.');
        watcher.close();
      }, 1000);
      this.on('added', function(filepath) {
        test.notEqual(path.relative(process.cwd(), filepath), path.join('nested', 'sub2'));
      });
      fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'nested', '.tmp'), 'Wake up!');
      watcher.on('end', test.done);
    });
  },
  deleted: function(test) {
    test.expect(1);
    var tmpfile = path.resolve(__dirname, 'fixtures', 'sub', 'deleted.js');
    fs.writeFileSync(tmpfile, 'var tmp = true;');
    gaze('**/*', function(err, watcher) {
      watcher.on('deleted', function(filepath) {
        test.equal(path.join('sub', 'deleted.js'), path.relative(process.cwd(), filepath));
        watcher.close();
      });
      this.on('changed', function() { test.ok(false, 'changed event should not have emitted.'); });
      this.on('added', function() { test.ok(false, 'added event should not have emitted.'); });
      fs.unlinkSync(tmpfile);
      watcher.on('end', test.done);
    });
  },
  dontEmitTwice: function(test) {
    test.expect(2);
    gaze('**/*', function(err, watcher) {
      watcher.on('all', function(status, filepath) {
        var expected = path.relative(process.cwd(), filepath);
        test.equal(path.join('sub', 'one.js'), expected);
        test.equal(status, 'changed');
        fs.readFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'));
        setTimeout(function() {
          fs.readFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'));
        }, 1000);
        // Give some time to accidentally emit before we close
        setTimeout(function() { watcher.close(); }, 5000);
      });
      setTimeout(function() {
        fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'), 'var one = true;');
      }, 1000);
      watcher.on('end', test.done);
    });
  },
  emitTwice: function(test) {
    test.expect(2);
    var times = 0;
    gaze('**/*', function(err, watcher) {
      watcher.on('all', function(status, filepath) {
        test.equal(status, 'changed');
        times++;
        setTimeout(function() {
          if (times < 2) {
            fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'), 'var one = true;');
          } else {
            watcher.close();
          }
        }, 1000);
      });
      setTimeout(function() {
        fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'one.js'), 'var one = true;');
      }, 1000);
      watcher.on('end', test.done);
    });
  },
  nonExistent: function(test) {
    test.expect(1);
    gaze('non/existent/**/*', function(err, watcher) {
      test.ok(true);
      test.done();
    });
  },
  differentCWD: function(test) {
    test.expect(1);
    var cwd = path.resolve(__dirname, 'fixtures', 'sub');
    gaze('two.js', {
      cwd: cwd
    }, function(err, watcher) {
      watcher.on('changed', function(filepath) {
        test.deepEqual(this.relative(), {'.':['two.js']});
        watcher.close();
      });
      fs.writeFileSync(path.resolve(cwd, 'two.js'), 'var two = true;');
      watcher.on('end', test.done);
    });
  },
  addedEmitInSubFolders: function(test) {
    test.expect(4);
    var adds = [
      { pattern: '**/*', file: path.resolve(__dirname, 'fixtures', 'nested', 'sub', 'added.js') },
      { pattern: '**/*', file: path.resolve(__dirname, 'fixtures', 'added.js') },
      { pattern: 'nested/**/*', file: path.resolve(__dirname, 'fixtures', 'nested', 'added.js') },
      { pattern: 'nested/sub/*.js', file: path.resolve(__dirname, 'fixtures', 'nested', 'sub', 'added.js') },
    ];
    grunt.util.async.forEachSeries(adds, function(add, next) {
      new gaze.Gaze(add.pattern, function(err, watcher) {
        watcher.on('added', function(filepath) {
          test.equal('added.js', path.basename(filepath));
          fs.unlinkSync(filepath);
          watcher.close();
          next();
        });
        watcher.on('changed', function() { test.ok(false, 'changed event should not have emitted.'); });
        watcher.on('deleted', function() { test.ok(false, 'deleted event should not have emitted.'); });
        fs.writeFileSync(add.file, 'var added = true;');
      });
    }, function() {
      test.done();
    });
  },
};
