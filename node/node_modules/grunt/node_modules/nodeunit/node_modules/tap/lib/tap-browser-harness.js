// this is just a harness that pipes to stdout.
// It's the default one.
module.exports = BrowserHarness

var BrowserHarness = global.TAP_Browser_Harness
  , inherits = require("inherits")
  , Results = require("./tap-results")
  , Harness = require("./tap-harness")
  , Test = require("./tap-test")

inherits(BrowserHarness, Harness)
function BrowserHarness (outPipe) {
  //console.error("calling BrowserHarness")
  if (browserHarness) return browserHarness
  if (!(this instanceof BrowserHarness)) {
    return browserHarness = new BrowserHarness
  }
  browserHarness = global.TAP_Browser_Harness = this
  BrowserHarness.super.call(this, Test)

  if (outPipe) this.output.pipe(outPipe)

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

  // TODO: handle global errors
  // process.on("unhandledException", function (e) {
  //   this.bailout("unhandled exception: " + e.message)
  // })
}
