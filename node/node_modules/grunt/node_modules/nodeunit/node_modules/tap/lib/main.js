
var GlobalHarness = require("./tap-global-harness")

// this lets you do stuff like:
// var test = require("tap").test
// test(...)
// to run stuff in the global harness.
exports = module.exports = new GlobalHarness()

exports.createProducer = exports.Producer = require("./tap-producer")
exports.createConsumer = exports.Consumer = require("./tap-consumer")
exports.yamlish = require("yamlish")
exports.createTest = exports.Test = require("./tap-test")
exports.createHarness = exports.Harness = require("./tap-harness")
exports.createRunner = exports.Runner = require("./tap-runner")
exports.assert = require("./tap-assert")
