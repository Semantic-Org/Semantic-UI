#!/usr/bin/env node

// read a tap stream from stdin.

var TapConsumer = require("../lib/tap-consumer")
  , TapProducer = require("../lib/tap-producer")

var tc = new TapConsumer
  , tp = new TapProducer

//process.stdin.pipe(tc)
process.stdin.on("data", function (c) {
  c = c + ""
  // console.error(JSON.stringify(c).substr(0, 100))
  tc.write(c)
})
process.stdin.on("end", function () { tc.end() })
process.stdin.resume()
//tc.pipe(tp)
tc.on("data", function (c) {
  tp.write(c)
})
tc.on("end", function () { tp.end() })

tp.on("data", function (c) {
  console.error(["output write", c])
  process.stdout.write(c)
})

tp.on("end", function (er, total, ok) {
  if (er) throw er
  process.exit(total - ok)
})
