var tap = require("../")

tap.test("consume yaml", function (t) {
  t.plan(1)

  var s =
    [ "not ok 1 beep boop"
    , "  ---"
    , "    stack:"
    , "      - rawr"
    , "      - dinosaurs"
    , "  ..."
    ].join("\n")
  , c = tap.createConsumer()

  c.on("data", function (res) {
    t.same(res, {
      id: 1
      , ok: false
      , name: " beep boop" // <-- should perhaps .trim() this?
      , stack: [ "rawr", "dinosaurs" ]
    })
    t.end()
  })
  c.write(s)
  c.end()
})
