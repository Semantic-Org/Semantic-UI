'use strict';

var grunt = require('../../lib/grunt');

exports['event'] = function(test) {
  test.expect(3);
  grunt.event.on('test.foo', function(a, b, c) {
    // This should get executed once (emit test.foo).
    test.equals(a + b + c, '123', 'Should have received the correct arguments.');
  });
  grunt.event.on('test.*', function(a, b, c) {
    // This should get executed twice (emit test.foo and test.bar).
    test.equals(a + b + c, '123', 'Should have received the correct arguments.');
  });
  grunt.event.emit('test.foo', '1', '2', '3');
  grunt.event.emit('test.bar', '1', '2', '3');
  test.done();
};
