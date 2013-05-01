#!/usr/bin/env node

// just an example, really
// Run with `node tap-http.js path/to/tests/`

var argv = process.argv.slice(2)
  , path = require("path")
  , Runner = require("../lib/tap-runner")

  , http = require("http")
  , server = http.createServer(function (req, res) {
    // it'd be nice to return a non-200 if the tests fail, but we don't
    // know the status until it's done, so that would mean not being able
    // to pipe the output
    res.writeHead(200, {'content-type': 'text/plain'})
    new Runner(argv, null).pipe(res)
  })

server.listen(1337)
