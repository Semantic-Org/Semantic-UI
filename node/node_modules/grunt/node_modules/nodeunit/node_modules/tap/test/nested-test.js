var tap = require("../"),
    test = tap.test,
    util = require('util');

test("parent", function (t) {
  // TODO: Make grandchildren tests count?
  t.plan(3);
  t.ok(true, 'p test');
  t.test("subtest", function (t) {
    t.ok(true, 'ch test');
    t.test('nested subtest', function(t) {
      t.ok(true, 'grch test');
      t.end();
    });
    t.end();
  });
  t.test('another subtest', function(t) {
    t.ok(true, 'ch test 2');
    t.end();
  });
  t.end();
})

