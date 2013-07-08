var through = require('..')

// must emit end before close.

exports['end before close'] = function (t) {
  var ts = through()
  var ended = false, closed = false

  ts.on('end', function () {
    t.ok(!closed)
    ended = true
  })
  ts.on('close', function () {
    t.ok(ended)
    closed = true
  })

  ts.write(1)
  ts.write(2)
  ts.write(3)
  ts.end()
  t.ok(ended)
  t.ok(closed)

  t.end()

}
