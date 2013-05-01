var tap = require("../")
  , fs = require("fs")
  , cp = require("child_process")

fs.writeFileSync("gc-script.js", "console.log(!!global.gc)", "utf8")

tap.test("gc test when the gc isn't there", function (t) {
  console.error("gc test")
  t.plan(1)
  console.error("t.plan="+t._plan)

  cp.exec("../bin/tap.js ./gc-script", function (err, stdo, stde) {
    console.error("assert gc does not exist")
    t.ok("false", stdo)
  })
})

tap.test("gc test when the gc should be there", function (t) {
  console.error("gc test")
  t.plan(2)
  console.error("t.plan="+t._plan)

  t.test("test for gc using --gc", function (t) {
    console.error("gc test using --gc")
    t.plan(1)
    console.error("t.plan="+t._plan)

    cp.exec("../bin/tap.js --gc ./gc-script", function (err, stdo, stde) {
      console.error("assert gc exists")
      t.ok("true", stdo)
    })
  })

  t.test("test for gc using --expose-gc", function (t) {
    console.error("gc test using --expose-gc")
    t.plan(1)
    console.error("t.plan="+t._plan)

    cp.exec("../bin/tap.js --expose-gc ./gc-script", function (err, stdo) {
      console.error("assert gc exists")
      t.ok("true", stdo)
    })
  })
})

fs.unlinkSync("gc-script.js");
