'use strict';

var gaze = require('../lib/gaze.js');
var path = require('path');
var fs = require('fs');

// Node v0.6 compat
fs.existsSync = fs.existsSync || path.existsSync;

// Clean up helper to call in setUp and tearDown
function cleanUp(done) {
  [
    'sub/rename.js',
    'sub/renamed.js'
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
  rename: function(test) {
    test.expect(2);
    var oldPath = path.join(__dirname, 'fixtures', 'sub', 'rename.js');
    var newPath = path.join(__dirname, 'fixtures', 'sub', 'renamed.js');
    fs.writeFileSync(oldPath, 'var rename = true;');
    gaze('**/*', function(err, watcher) {
      watcher.on('renamed', function(newFile, oldFile) {
        test.equal(newFile, newPath);
        test.equal(oldFile, oldPath);
        watcher.close();
        test.done();
      });
      fs.renameSync(oldPath, newPath);
    });
  }
};
