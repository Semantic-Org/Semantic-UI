// https://github.com/isaacs/node-tap/issues/24

var tap = require("../")
  , test = tap.test

var config = {foo: "bar"}
test("one", config, function(t) {
  t.equal(t.conf.foo, "bar")
  t.equal(t.conf.name, "one")  // before fix this would be "two"
  t.end()
})
test("two", config, function(t) {
  t.equal(t.conf.foo, "bar")
  t.equal(t.conf.name, "two")
  t.end()
})
