var test = require("../").test

test("same buffers", function (t) {
  t.same(new Buffer([3,4,243]), new Buffer([3,4,243]))
  t.end()
})

test("not same buffers", function (t) {
  t.notSame(new Buffer([3,5,243]), new Buffer([3,4,243]))
  t.end()
})
