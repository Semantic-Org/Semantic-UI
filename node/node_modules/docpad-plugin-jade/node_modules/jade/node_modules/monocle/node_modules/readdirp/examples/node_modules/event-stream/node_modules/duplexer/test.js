var duplex = require("./index")
    , assert = require("assert")
    , through = require("through")

var readable = through()
    , writable = through(write)
    , written = 0
    , data = 0

var stream = duplex(writable, readable)

function write() {
    written++
}

stream.on("data", ondata)

function ondata() {
    data++
}

stream.write()
readable.emit("data")

assert.equal(written, 1)
assert.equal(data, 1)
console.log("DONE")