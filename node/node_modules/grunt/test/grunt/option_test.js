'use strict';

var grunt = require('../../lib/grunt');

exports['option'] = {
  setUp: function(done) {
    grunt.option.init();
    done();
  },
  tearDown: function(done) {
    grunt.option.init();
    done();
  },
  'option.init': function(test) {
    test.expect(1);
    var expected = {foo:'bar',bool:true,'bar':{foo:'bar'}};
    test.deepEqual(grunt.option.init(expected), expected);
    test.done();
  },
  'option': function(test) {
    test.expect(4);
    test.equal(grunt.option('foo', 'bar'), grunt.option('foo'));
    grunt.option('foo', {foo:'bar'});
    test.deepEqual(grunt.option('foo'), {foo:'bar'});
    test.equal(grunt.option('no-there'), false);
    grunt.option('there', false);
    test.equal(grunt.option('no-there'), true);
    test.done();
  },
  'option.flags': function(test) {
    test.expect(1);
    grunt.option.init({
      foo: 'bar',
      there: true,
      obj: {foo: 'bar'},
      arr: []
    });
    test.deepEqual(grunt.option.flags(), ['--foo=bar', '--there', '--obj=[object Object]']);
    test.done();
  },
};
