
var Stream = require('stream')

// from
//
// a stream that reads from an source.
// source may be an array, or a function.
// from handles pause behaviour for you.

module.exports =
function from (source) {
  if(Array.isArray(source))
    return from (function (i) {
      if(source.length)
        this.emit('data', source.shift())
      else
        this.emit('end')
      return true
    })

  var s = new Stream(), i = 0, ended = false, started = false
  s.readable = true
  s.writable = false
  s.paused = false
  s.pause = function () {
    started = true
    s.paused = true
  }
  function next () {
    var n = 0, r = false
    if(ended) return
    while(!ended && !s.paused && source.call(s, i++, function () {
      if(!n++ && !s.ended && !s.paused)
          next()
    }))
      ;
  }
  s.resume = function () {
    started = true
    s.paused = false
    next()
  }
  s.on('end', function () {
    ended = true
    s.readable = false
    process.nextTick(s.destroy)
  })
  s.destroy = function () {
    ended = true
    s.emit('close') 
  }
  /*
    by default, the stream will start emitting at nextTick
    if you want, you can pause it, after pipeing.
    you can also resume before next tick, and that will also
    work.
  */
  process.nextTick(function () {
    if(!started) s.resume()
  })
  return s
}
