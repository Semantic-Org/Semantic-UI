
var n = 'rc'+Math.random()
var assert = require('assert')

process.env[n+'_envOption'] = 42

var config = require('./')(n, {
  option: true
})

console.log(config)

assert.equal(config.option, true)
assert.equal(config.envOption, 42)
