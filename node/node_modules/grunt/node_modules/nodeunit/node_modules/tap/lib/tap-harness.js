// a thing that runs tests.
// Every "test" is also a harness.  If they do not have a harness,
// then they are attached to the defaut "global harness",
// which writes its results to stdout.


// TODO:
// - Bailout should stop running any tests.
// - "skip" in the test config obj should skip it.

module.exports = Harness
require("inherits")(Harness, require("events").EventEmitter)

var Results = require("./tap-results")
  , TapProducer = require("./tap-producer")
  , assert = require("./tap-assert")

function Harness (Test) {
  if (!(this instanceof Harness)) return new Harness(Test)

  //console.error("Test in "+this.constructor.name, Test)

  this._Test = Test
  this._plan = null
  this._children = []
  this._started = false

  this._testCount = 0
  this._planSum = 0

  this.results = new Results()
  // emit result events on the harness.
  //this.results.on("result", function (res) {
  //  console.error("proxying result ev from res to harness")
  //  this.emit("result", res)
  //}.bind(this))
  var me = this
  this.results.on("result", this.emit.bind(this, "result"))

  var p = this.process.bind(this)
  this.process = function () {
    this._started = true
    process.nextTick(p)
  }

  this.output = new TapProducer()
  Harness.super.call(this)
}

// this function actually only gets called bound to
// the Harness object, and on process.nextTick.  Even if
// passed as an event handler, everything *else* will
// happen before it gets called.
Harness.prototype.process = function () {
  //console.error("harness process")
  // "end" can emit multiple times, so only actually move on
  // to the next test if the current one is actually over.
  // TODO: multiple in-process tests, if all are marked "async"
  if (this._current) {
    if (!this._current._ended) return
    // handle the current one before moving onto the next.
    this.childEnd(this._current)
  }
  var skip = true
  while (skip) {
    //console.error("checking for skips")
    var current = this._current = this._children.shift()
    if (current) {
      skip = current.conf.skip
      if (skip) {
        //console.error("add a failure for the skipping")
        this.results.add(assert.fail(current.conf.name
                                    ,{skip:true, diag:false}))
      }
    } else skip = false
  }

  // keep processing through skipped tests, instead of running them.
  if (current && this._bailedOut) {
    return this.process()
  }

  //console.error("got current?", !!current)
  if (current) {
    current.on("end", this.process)
    current.emit("ready")
    //console.error("emitted ready")
    //console.error("_plan", this._plan, this.constructor.name)
  } else {
    //console.error("Harness process: no more left.  ending")
    if (this._endNice) {
      this._endNice()
    } else {
      this.end()
    }
  }
}

Harness.prototype.end = function () {
  if (this._children.length) {
    return this.process()
  }
  //console.error("harness end", this.constructor.name)
  if (this._bailedOut) return

  // can't call .end() more than once.
  if (this._ended) {
    //console.error("adding failure for end calling")
    this.results.add(assert.fail("end called more than once"))
  }

  // see if the plan is completed properly, if there was one.
  if (this._plan !== null) {
    var total = this._testCount
    if (total !== this._plan) {
      this.results.add(assert.equal(total, this._plan, "test count != plan"))
    }
    this._plan = total
  }

  //console.error("setting ended true", this.constructor.name)
  this._ended = true
  this.emit("end")
}

Harness.prototype.plan = function (p) {
  //console.error("setting plan", new Error().stack)
  if (this._plan !== null) {
    //console.error("about to add failure for calling plan")
    return this.results.add(assert.fail("plan set multiple times"))
  }
  this._plan = p
  if (p === 0 || this.results.testsTotal) {
    this.end()
  }
}

Harness.prototype.childEnd = function (child) {
  //console.error("childEnd")
  this._testCount ++
  this._planSum += child._plan
  //console.error("adding set of child.results")

  this.results.add(child.conf.name || "(unnamed test)")
  this.results.addSet(child.results)
  this.emit("childEnd", child)
  // was this planned?
  if (this._plan === this._testCount) {
    //console.error("plan", [this._plan, this._testCount])
    return this.end()
  }
}

function copyObj(o) {
  var copied = {}
  Object.keys(o).forEach(function (k) { copied[k] = o[k] })
  return copied
}

Harness.prototype.test = function test (name, conf, cb) {
  if (this._bailedOut) return

  if (typeof conf === "function") cb = conf, conf = null
  if (typeof name === "object") conf = name, name = null
  if (typeof name === "function") cb = name, name = null

  conf = (conf ? copyObj(conf) : {})
  name = name || ""

  //console.error("making test", [name, conf, cb])

  // timeout: value in milliseconds. Defaults to 30s
  // Set to Infinity to have no timeout.
  if (isNaN(conf.timeout)) conf.timeout = 30000
  var t = new this._Test(this, name, conf)
  var self = this
  if (cb) {
    //console.error("attaching cb to ready event")
    t.on("ready", function () {
      if (!isNaN(conf.timeout) && isFinite(conf.timeout)) {
        var timer = setTimeout(this.timeout.bind(this), conf.timeout)
        var clear = function () {
          clearTimeout(timer)
        }
        t.on("end", clear)
        t.on("bailout", function (message) {
          self.bailout(message)
          clear()
        })
      }
    })
    t.on("ready", cb.bind(t, t))
    // proxy the child results to this object.
    //t.on("result", function (res) {
    //  console.error("in harness, proxying result up")
    //  t.results.add(res)
    //})
  }
  return t
}

Harness.prototype.bailout = function (message) {
  // console.error("Harness bailout", this.constructor.name)
  message = message || ""
  //console.error("adding bailout message result")
  this.results.add({bailout: message})
  // console.error(">>> results after bailout" , this.results)
  this._bailedOut = true
  this.emit("bailout", message)
  this.output.end({bailout: message})
}

Harness.prototype.add = function (child) {
  //console.error("adding child")
  this._children.push(child)
  if (!this._started) this.process()
}

// the tearDown function is *always* guaranteed to happen.
// Even if there's a bailout.
Harness.prototype.tearDown = function (fn) {
  this.on("end", fn)
}
