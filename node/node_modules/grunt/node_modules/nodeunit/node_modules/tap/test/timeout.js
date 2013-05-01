var tap = require("../")

tap.test("timeout test with plan only", function (t) {
  console.error("timeout test")
  t.plan(2)
  console.error("t.plan="+t._plan)
  setTimeout(function () {
    console.error("a assert")
    t.ok(true, "a")
  }, 1000)
  setTimeout(function () {
    console.error("b assert")
    t.ok(true, "b")
  }, 1000)
})

tap.test("timeout test with plan and end", function (t) {
  console.error("timeout test")
  t.plan(2)

  var tc = 2
  console.error("t.plan="+t._plan)
  setTimeout(function () {
    console.error("a assert")
    t.ok(true, "a")
    if (-- tc === 0) t.end()
  }, 1000)
  setTimeout(function () {
    console.error("b assert")
    t.ok(true, "b")
    if (-- tc === 0) t.end()
  }, 1000)
})
