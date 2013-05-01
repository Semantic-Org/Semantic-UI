// A class for counting up results in a test harness.

module.exports = Results

var inherits = require("inherits")
  , EventEmitter = require("events").EventEmitter

inherits(Results, EventEmitter)

function Results (r) {
  //console.error("result constructor", r)
  this.ok = true
  this.addSet(r)
}

Results.prototype.addSet = function (r) {
  //console.error("add set of results", r)
  r = r || {ok: true}
  ; [ "todo"
    , "todoPass"
    , "todoFail"
    , "skip"
    , "skipPass"
    , "skipFail"
    , "pass"
    , "passTotal"
    , "fail"
    , "failTotal"
    , "tests"
    , "testsTotal" ].forEach(function (k) {
      this[k] = (this[k] || 0) + (r[k] || 0)
      //console.error([k, this[k]])
    }, this)

  this.ok = this.ok && r.ok && true
  this.bailedOut = this.bailedOut || r.bailedOut || false
  this.list = (this.list || []).concat(r.list || [])
  this.emit("set", this.list)
  //console.error("after addSet", this)
}

Results.prototype.add = function (r, addToList) {
  //console.error("add result", r)
  var pf = r.ok ? "pass" : "fail"
    , PF = r.ok ? "Pass" : "Fail"

  this.testsTotal ++
  this[pf + "Total"] ++

  if (r.skip) {
    this["skip" + PF] ++
    this.skip ++
  } else if (r.todo) {
    this["todo" + PF] ++
    this.todo ++
  } else {
    this.tests ++
    this[pf] ++
  }

  if (r.bailout || typeof r.bailout === "string") {
    // console.error("Bailing out in result")
    this.bailedOut = true
  }
  this.ok = !!(this.ok && r.ok)

  if (addToList === false) return
  this.list = this.list || []
  this.list.push(r)
  this.emit("result", r)
}
