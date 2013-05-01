var test = require('tap').test,
    Bar = require('../lib/bar'),
    bar;

test('setup', function(t) {
  bar = new Bar('baz');
  t.ok(bar);
  t.end();
});

test('bar', function(t) {
  t.equal('baz', bar.foo());
  t.end();
});

test('teardown', function(t) {
  t.ok(true);
  t.end();
});

