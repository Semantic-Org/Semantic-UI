var test = require('../').test
var Runner = require('../lib/tap-runner.js')
var TC = require('../lib/tap-consumer.js')

var fs = require('fs')
var spawn = require('child_process').spawn
var segv =
    'int main (void) {\n' +
    '   char *s = "hello world";\n' +
    '   *s = \'H\';\n' +
    '}\n'
var compiled = false

test('setup', function (t) {
  fs.writeFile('segv.c', segv, 'utf8', function (er) {
    if (er)
      throw er
    var cp = spawn('gcc', ['segv.c', '-o', 'segv'])
    cp.on('exit', function (code, sig) {
      if (code !== 0) {
        t.bailout('failed to compile segv program')
        return
      }
      t.pass('compiled seg faulter')
      t.end()
    })
  })
})

test('segv', function (t) {
  var r = new Runner({argv:{remain:['./segv']}})
  var tc = new TC()
  var expect =
      [ 'TAP version 13'
      , './segv'
      , { 'id': 1,
          'ok': false,
          'name': ' ././segv',
          'exit': null,
          'timedOut': true,
          'signal': 'SIGBUS',
          'command': '"./segv"' }
      , 'tests 1'
      , 'fail  1' ]
  r.pipe(tc)
  tc.on('data', function (d) {
    t.same(d, expect.shift())
  })
  tc.on('end', function () {
    t.equal(expect.length, 0)
    t.end()
  })
})

test('cleanup', function (t) {
  fs.unlink('segv.c', function () {
    fs.unlink('segv', function () {
      t.pass('cleaned up')
      t.end()
    })
  })
})
