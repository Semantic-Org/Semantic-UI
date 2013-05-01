var test = require("../../").test

test(function (t) {
  t.plan(1)

  t.on('end', function () {
    console.log('end()')
    throw new Error('beep')
  })

  t.equal(3, 3)
})
