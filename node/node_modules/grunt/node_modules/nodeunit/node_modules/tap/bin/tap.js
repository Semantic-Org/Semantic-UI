#!/usr/bin/env node

var argv = process.argv.slice(2)
  , path = require("path")
  , Runner = require("../lib/tap-runner")

  , nopt = require("nopt")

  , knownOpts =
    { cover: [path, false]
    , "cover-dir": path
    , stderr: Boolean
    , stdout: Boolean
    , diag: Boolean
    , version: Boolean
    , tap: Boolean
    , timeout: Number
    , gc: Boolean
    }

  , shorthands =
    // debugging 1: show stderr
    { d: ["--stderr"]
    // debugging 2: show stderr and tap
    , dd: ["--stderr", "--tap"]
    // debugging 3: show stderr, tap, AND always show diagnostics.
    , ddd: ["--stderr", "--tap", "--diag"]
    , "expose-gc": ["--gc"]
    , g: ["--gc"]
    , e: ["--stderr"]
    , t: ["--timeout"]
    , o: ["--tap"]
    , c: ["--cover"]
    , v: ["--version"]
    , "?": ["--help"]
    , h: ["--help"]
    }

  , defaults =
    { cover: "./lib"
    , "cover-dir": "./coverage"
    , stderr: process.env.TAP_STDERR
    , tap: process.env.TAP
    , diag: process.env.TAP_DIAG
    , timeout: +process.env.TAP_TIMEOUT || 30
    , gc: false
    , version: false
    , help: false }

  , options = nopt(knownOpts, shorthands)

if (options.version) {
  console.log(require("../package.json").version)
  process.exit(0)
}

if (options.help) {
  console.log(function(){/*

Usage:
    tap <options> <files>

    Run the files as tap tests, parse the output, and report the results

Options:

    --stderr    Print standard error output of tests to standard error.
    --tap       Print raw tap output.
    --diag      Print diagnostic output for passed tests, as well as failed.
                (Implies --tap)
    --gc        Expose the garbage collector to tests.
    --timeout   Maximum time to wait for a subtest, in seconds. Default: 30
    --version   Print the version of node tap.
    --help      Print this help.

Please report bugs!  https://github.com/isaacs/node-tap/issues

*/}.toString().split(/\n/).slice(1, -1).join("\n"))
  process.exit(0)
}


Object.keys(defaults).forEach(function (k) {
  if (!options.hasOwnProperty(k)) options[k] = defaults[k]
})

// other tests that might rely on these
if (options.diag) process.env.TAP_DIAG = true
if (options.tap) process.env.TAP = true
if (options.timeout) process.env.TAP_TIMEOUT = options.timeout

var r = new Runner(options)
  , TapProducer = require("../lib/tap-producer")

if (options.tap || options.diag) {
  r.pipe(process.stdout)
} else {
  r.on("file", function (file, results, details) {
    var s = (details.ok ? "" : "not ") + "ok "+results.name
      , n = details.pass + "/" + details.testsTotal
      , dots = new Array(Math.max(1, 60 - s.length - n.length)).join(".")
    console.log("%s %s %s", s, dots, n)
    if (details.ok) {
      if (details.skip) {
        console.log("  skipped: %s", details.skipTotal)
      }
    } else {
      // console.error(details)
      console.log("    Command: %s", results.command)
      console.log("    " + TapProducer.encode(details.list)
                  .split(/\n/).join("\n    "))
    }
  })
  r.on("end", function () {
    //console.log(r)
    var s = "total"
      , n = r.results.pass + "/" + r.results.testsTotal
      , dots = new Array(60 - s.length - n.length).join(".")
      , ok = r.results.ok ? "ok" : "not ok"
    console.log("%s %s %s\n\n%s", s, dots, n, ok)
    if (r.doCoverage) {
      console.error( "\nCoverage: %s\n"
                   , path.resolve(r.coverageOutDir, "index.html") )
    }
  })
}



r.on("end", function () {
  process.exit(r.results.tests - r.results.pass)
})
