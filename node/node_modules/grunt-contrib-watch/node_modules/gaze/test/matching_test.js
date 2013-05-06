'use strict';

var gaze = require('../lib/gaze.js');
var path = require('path');

exports.matching = {
  setUp: function(done) {
    process.chdir(path.resolve(__dirname, 'fixtures'));
    done();
  },
  globAll: function(test) {
    test.expect(2);
    gaze('**/*', function() {
      var result = this.relative(null, true);
      test.deepEqual(result['.'], ['Project (LO)/', 'nested/', 'one.js', 'sub/']);
      test.deepEqual(result['sub/'], ['one.js', 'two.js']);
      this.close();
      test.done();
    });
  },
  relativeDir: function(test) {
    test.expect(1);
    gaze('**/*', function() {
      test.deepEqual(this.relative('sub', true), ['one.js', 'two.js']);
      this.close();
      test.done();
    });
  },
  globArray: function(test) {
    test.expect(2);
    gaze(['*.js', 'sub/*.js'], function() {
      var result = this.relative(null, true);
      test.deepEqual(result['.'], ['one.js']);
      test.deepEqual(result['sub/'], ['one.js', 'two.js']);
      this.close();
      test.done();
    });
  },
  globArrayDot: function(test) {
    test.expect(1);
    gaze(['./sub/*.js'], function() {
      var result = this.relative(null, true);
      test.deepEqual(result['sub/'], ['one.js', 'two.js']);
      this.close();
      test.done();
    });
  },
  oddName: function(test) {
    test.expect(1);
    gaze(['Project (LO)/*.js'], function() {
      var result = this.relative(null, true);
      test.deepEqual(result['Project (LO)/'], ['one.js']);
      this.close();
      test.done();
    });
  }
};
