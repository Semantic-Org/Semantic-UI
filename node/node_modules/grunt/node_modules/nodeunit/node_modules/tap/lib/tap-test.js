// This is a very simple test framework that leverages the tap framework
// to run tests and output tap-parseable results.

module.exports = Test

var assert = require("./tap-assert")
  , inherits = require("inherits")
  , Results = require("./tap-results")

// tests are also test harnesses
inherits(Test, require("./tap-harness"))

function Test (harness, name, conf) {
  //console.error("test ctor")
  if (!(this instanceof Test)) return new Test(harness, name, conf)

  Test.super.call(this, Test)

  conf.name = name || conf.name || "(anonymous)"
  this.conf = conf

  this.harness = harness
  this.harness.add(this)
}

// it's taking too long!
Test.prototype.timeout = function () {
  // detect false alarms
  if (this._ended) return
  this.fail("Timeout!")
  this.end()
}

Test.prototype.clear = function () {
  this._started = false
  this._ended = false
  this._plan = null
  this._bailedOut = false
  this._testCount = 0
  this.results = new Results()
}

// this gets called if a test throws ever
Test.prototype.threw = function (ex) {
  //console.error("threw!", ex.stack)
  this.fail(ex.name + ": " + ex.message, { error: ex, thrown: true })
  // may emit further failing tests if the plan is not completed
  //console.error("end, because it threw")
  if (!this._ended) this.end()
}

Test.prototype.comment = function (m) {
  if (typeof m !== "string") {
    return this.fail("Test.comment argument must be a string")
  }
  this.result("\n" + m.trim())
}

Test.prototype.result = function (res) {
  this.results.add(res)
  this._testCount ++
  this.emit("result", res)
  if (this._plan === this._testCount) {
    process.nextTick(this._endNice.bind(this))
  }
}

Test.prototype._endNice = function () {
  if (!this._ended) this.end()
}

// parasitic
// Who says you can't do multiple inheritance in js?
Object.getOwnPropertyNames(assert).forEach(function (k) {
  if (k === "prototype" || k === "name") return
  var d = Object.getOwnPropertyDescriptor(assert, k)
    , v = d.value
  if (!v) return
  d.value = assertParasite(v)
  Object.defineProperty(Test.prototype, k, d)
})

function assertParasite (fn) { return function _testAssert () {
  //console.error("_testAssert", fn.name, arguments)
  if (this._bailedOut) return
  var res = fn.apply(assert, arguments)
  this.result(res)
  return res
}}

// a few tweaks on the EE emit function, because
// we want to catch all thrown errors and bubble up "bailout"
Test.prototype.emit = (function (em) { return function (t) {
  // bailouts bubble until handled
  if (t === "bailout" &&
      this.listeners(t).length === 0 &&
      this.harness) {
    return this.harness.bailout(arguments[1])
  }

  if (t === "error") return em.apply(this, arguments)
  try {
    em.apply(this, arguments)
  } catch (ex) {
    // any exceptions in a test are a failure
    //console.error("caught!", ex.stack)
    this.threw(ex)
  }
}})(Test.super.prototype.emit)
