var tap = require("../")
  , test = tap.test
  , plan = tap.plan

plan(2)

test("trivial success", function (t) {
  t.ok(true, "it works")
  t.end()
})

test("two tests", function (t) {
  t.equal(255, 0xFF, "math should work")
  t.notOk(false, "false should not be ok")
  t.end()
})
