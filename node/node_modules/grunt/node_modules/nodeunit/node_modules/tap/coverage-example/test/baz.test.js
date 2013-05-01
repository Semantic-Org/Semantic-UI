var test = require('tap').test,
    Foo = require('../lib/foo'),
    Bar = require('../lib/bar'),
    foo, bar;

test('setup', function(t) {
  foo = new Foo('baz');
  t.ok(foo);
  bar = new Bar('baz');
  t.ok(bar);
  t.end();
});

test('baz from Foo', function(t) {
  t.equal('baz', foo.baz());
  t.end();
});

test('baz from Bar', function(t) {
  t.equal('baz', bar.baz());
  t.end();
});


test('teardown', function(t) {
  t.ok(true);
  t.end();
});

