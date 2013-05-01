var test = require('tap').test,
    Foo = require('../lib/foo'),
    foo;

test('setup', function(t) {
  foo = new Foo('baz');
  t.ok(foo);
  t.end();
});

test('bar', function(t) {
  t.equal('baz', foo.bar());
  t.end();
});

test('teardown', function(t) {
  t.ok(true);
  t.end();
});

