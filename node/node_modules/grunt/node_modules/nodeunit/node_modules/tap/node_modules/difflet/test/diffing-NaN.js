var difflet = require('../');
var diff = difflet();
var test = require('tap').test;

test('diffing NaN against NaN', function (t) {
  t.plan(1);
  var d = diff.compare(NaN, NaN);

  t.equal(d, 'NaN');
});

test('diffing { o: NaN } against { o: NaN }', function (t) {
  t.plan(1);
  var d = diff.compare({ o: NaN }, { o: NaN });

  t.equal(d, '{"o":NaN}');
});
