module.exports = TapProducer

var Results = require("./tap-results")
  , inherits = require("inherits")
  , yamlish = require("yamlish")

TapProducer.encode = function (result, diag) {
  var tp = new TapProducer(diag)
    , out = ""
  tp.on("data", function (c) { out += c })
  if (Array.isArray(result)) {
    result.forEach(tp.write, tp)
  } else tp.write(result)
  tp.end()
  return out
}

inherits(TapProducer, require("stream").Stream)
function TapProducer (diag) {
  TapProducer.super.call(this)
  this.diag = diag
  this.count = 0
  this.readable = this.writable = true
  this.results = new Results
}

TapProducer.prototype.trailer = true

TapProducer.prototype.write = function (res) {
  // console.error("TapProducer.write", res)
  if (typeof res === "function") throw new Error("wtf?")
  if (!this.writable) this.emit("error", new Error("not writable"))

  if (!this._didHead) {
    this.emit("data", "TAP version 13\n")
    this._didHead = true
  }

  var diag = res.diag
  if (diag === undefined) diag = this.diag

  this.emit("data", encodeResult(res, this.count + 1, diag))

  if (typeof res === "string") return true

  if (res.bailout) {
    var bo = "bail out!"
    if (typeof res.bailout === "string") bo += " " + res.bailout
    this.emit("data", bo)
    return
  }
  this.results.add(res, false)

  this.count ++
}

TapProducer.prototype.end = function (res) {
  if (res) this.write(res)
  // console.error("TapProducer end", res, this.results)
  this.emit("data", "\n1.."+this.results.testsTotal+"\n")
  if (this.trailer && typeof this.trailer !== "string") {
    // summary trailer.
    var trailer = "tests "+this.results.testsTotal + "\n"
    if (this.results.pass) {
      trailer += "pass  " + this.results.pass + "\n"
    }
    if (this.results.fail) {
      trailer += "fail  " + this.results.fail + "\n"
    }
    if (this.results.skip) {
      trailer += "skip  "+this.results.skip + "\n"
    }
    if (this.results.todo) {
      trailer += "todo  "+this.results.todo + "\n"
    }
    if (this.results.bailedOut) {
      trailer += "bailed out" + "\n"
    }

    if (this.results.testsTotal === this.results.pass) {
      trailer += "\nok\n"
    }
    this.trailer = trailer
  }
  if (this.trailer) this.write(this.trailer)
  this.writable = false
  this.emit("end", null, this.count, this.ok)
}

function encodeResult (res, count, diag) {
  // console.error(res, count, diag)
  if (typeof res === "string") {
    res = res.split(/\r?\n/).map(function (l) {
      if (!l.trim()) return l.trim()
      return "# " + l
    }).join("\n")
    if (res.substr(-1) !== "\n") res += "\n"
    return res
  }

  if (res.bailout) return ""


  if (!!process.env.TAP_NODIAG) diag = false
  else if (!!process.env.TAP_DIAG) diag = true
  else if (diag === undefined) diag = !res.ok

  var output = ""
  res.name = res.name && ("" + res.name).trim()
  output += ( !res.ok ? "not " : "") + "ok " + count
            + ( !res.name ? ""
              : " " + res.name.replace(/[\r\n]/g, " ") )
            + ( res.skip ? " # SKIP"
              : res.todo ? " # TODO"
              : "" )
            + "\n"

  if (!diag) return output
  var d = {}
    , dc = 0
  Object.keys(res).filter(function (k) {
    return k !== "ok" && k !== "name" && k !== "id"
  }).forEach(function (k) {
    dc ++
    d[k] = res[k]
  })
  //console.error(d, "about to encode")
  if (dc > 0) output += "  ---"+yamlish.encode(d)+"\n  ...\n"
  return output
}
