var tap = require("tap")
  , test = tap.test

test("bailout test", { skip: false }, function (t) {

  // t.once("bailout", function () {
  //   console.error("bailout event")//, t)
  //   t.clear()
  // })

  // t.once("end", function () {
  //   console.error("end event")
  // })

  // simulate three tests where the second bails out.
  t.test("first", function (t) {
    t.pass("this is ok")
    t.end()
  })

  t.test("bailout", function (t) {
    console.error("bailout test")
    t.pass("pass")
    t.bailout("bail out message")
    t.fail("fail")
    t.end()
  })

  t.test("second (should not happen)", function (t) {
    t.fail("this should not happen")
    t.end()
  })

  t.end()

})
