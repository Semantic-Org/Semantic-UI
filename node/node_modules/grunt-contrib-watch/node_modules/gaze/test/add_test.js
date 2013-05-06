'use strict';

var Gaze = require('../lib/gaze.js').Gaze;
var path = require('path');
var fs = require('fs');

exports.add = {
  setUp: function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures'));
    done();
  },
  addToWatched: function(test) {
    test.expect(1);
    var files = [
      'Project (LO)/',
      'Project (LO)/one.js',
      'nested/',
      'nested/one.js',
      'nested/three.js',
      'nested/sub/',
      'nested/sub/two.js',
      'one.js'
    ];
    var expected = {
      'Project (LO)/': ['one.js'],
      '.': ['Project (LO)/', 'nested/', 'one.js'],
      'nested/': ['one.js', 'three.js', 'sub/'],
      'nested/sub/': ['two.js']
    };
    var gaze = new Gaze('addnothingtowatch');
    gaze._addToWatched(files);
    test.deepEqual(gaze.relative(null, true), expected);
    test.done();
  },
  addLater: function(test) {
    test.expect(3);
    new Gaze('sub/one.js', function(err, watcher) {
      test.deepEqual(watcher.relative('sub'), ['one.js']);
      watcher.add('sub/*.js', function() {
        test.deepEqual(watcher.relative('sub'), ['one.js', 'two.js']);
        watcher.on('changed', function(filepath) {
          test.equal('two.js', path.basename(filepath));
          watcher.close();
          test.done();
        });
        fs.writeFileSync(path.resolve(__dirname, 'fixtures', 'sub', 'two.js'), 'var two = true;');
      });
    });
  }
};
