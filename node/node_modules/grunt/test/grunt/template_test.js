var grunt = require('../../lib/grunt');

exports['template'] = {
  'process': function(test) {
    test.expect(4);
    var obj = {
      foo: 'c',
      bar: 'b<%= foo %>d',
      baz: 'a<%= bar %>e'
    };

    test.equal(grunt.template.process('<%= foo %>', obj), 'c', 'should retrieve value.');
    test.equal(grunt.template.process('<%= bar %>', obj), 'bcd', 'should recurse.');
    test.equal(grunt.template.process('<%= baz %>', obj), 'abcde', 'should recurse.');

    obj.foo = '<% oops %';
    test.equal(grunt.template.process('<%= baz %>', obj), 'ab<% oops %de', 'should not explode.');
    test.done();
  }
};
