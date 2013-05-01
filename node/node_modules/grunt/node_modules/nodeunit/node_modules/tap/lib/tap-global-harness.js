// this is just a harness that pipes to stdout.
// It's the default one.
module.exports = GlobalHarness

var globalHarness = global.TAP_Global_Harness
  , inherits = require("inherits")
  , Results = require("./tap-results")
  , Harness = require("./tap-harness")
  , Test = require("./tap-test")

inherits(GlobalHarness, Harness)
function GlobalHarness () {
  //console.error("calling GlobalHarness")
  if (globalHarness) return globalHarness
  if (!(this instanceof GlobalHarness)) {
    return globalHarness = new GlobalHarness
  }

  globalHarness = global.TAP_Global_Harness = this
  GlobalHarness.super.call(this, Test)

  this.output.pipe(process.stdout)
  //this.output.on("data", function () {
  //  process.nextTick(process.stdout.flush.bind(process.stdout))
  //})

  this.test = this.test.bind(this)

  this.plan = this.plan.bind(this)

  var output = this.output
  this.on("childEnd", function (child) {
    //console.error("childEnd in global harness")
    //console.error(child.results)
    // write out the stuff for this child.
    //console.error("child.conf", child.conf)

    // maybe write some other stuff about the number of tests in this
    // thing, etc.  I dunno.
    //console.error("child results", child.results)
    this.results.list.forEach(function (res) {
      //delete res.error
      //console.error("child resuilt", res)
      output.write(res)
    })
    //console.error("wrote child results")
    this.results.list.length = 0
  })

  var streamEnded = false
  this.on("end", function () {
    //console.error("global ending the stream")
    if (!streamEnded) {
      this.results.list.forEach(function (res) {
        output.write(res)
      })
      this.results.list.length = 0
      output.end()
      streamEnded = true
    }
  })

  //this.on("end", this.output.end.bind(this.output))

  process.on("unhandledException", function (e) {
    this.bailout("unhandled exception: " + e.message)
  })
}
