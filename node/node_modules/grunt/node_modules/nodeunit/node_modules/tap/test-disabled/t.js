var test = require('tap').test;

function foo() {
  throw new Error('one');
}

test('demonstrate bug in t.throws', function (t) {
  t.throws(
    function () {
      foo();
    },
    new Error('two')),
    // "this should throw",
    // {}); // not 'one'!
  t.end();
});
