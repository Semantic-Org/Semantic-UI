var Stream = require('stream')

/*
  was gonna use through for this,
  but it does not match quite right,
  because you need a seperate pause
  mechanism for the readable and writable
  sides.
*/

module.exports = function () {
  var buffer = [], ended = false, destroyed = false
  var stream = new Stream() 
  stream.writable = stream.readable = true
  stream.paused = false 
  
  stream.write = function (data) {
    if(!this.paused)
      this.emit('data', data)
    else 
      buffer.push(data)
    return !(this.paused || buffer.length)
  }
  function onEnd () {
    stream.readable = false
    stream.emit('end')
    process.nextTick(stream.destroy.bind(stream))
  }
  stream.end = function (data) {
    if(data) this.write(data)
    this.ended = true
    this.writable = false
    if(!(this.paused || buffer.length))
      return onEnd()
    else
      this.once('drain', onEnd)
    this.drain()
  }

  stream.drain = function () {
    while(!this.paused && buffer.length)
      this.emit('data', buffer.shift())
    //if the buffer has emptied. emit drain.
    if(!buffer.length && !this.paused)
      this.emit('drain')
  }

  stream.resume = function () {
    //this is where I need pauseRead, and pauseWrite.
    //here the reading side is unpaused,
    //but the writing side may still be paused.
    //the whole buffer might not empity at once.
    //it might pause again.
    //the stream should never emit data inbetween pause()...resume()
    //and write should return !buffer.length

    this.paused = false
//    process.nextTick(this.drain.bind(this)) //will emit drain if buffer empties.
    this.drain()
    return this
  }

  stream.destroy = function () {
    if(destroyed) return
    destroyed = ended = true     
    buffer.length = 0
    this.emit('close')
  }

  stream.pause = function () {
    stream.paused = true
    return this
  }
 
  return stream
}
