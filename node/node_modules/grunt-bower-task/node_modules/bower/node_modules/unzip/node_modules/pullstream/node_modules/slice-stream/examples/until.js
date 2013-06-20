var SliceStream = require('../');
var streamBuffers = require("stream-buffers");

var ss = new SliceStream({ length: 5}, function (buf, sliceEnd, extra) {
  if (!sliceEnd) {
    return this.push(buf);
  }
  this.push(buf);
  return this.push(null); //signal end of data
});

var sourceStream = new streamBuffers.ReadableStreamBuffer();
sourceStream.put("Hello World");
var writableStream = new streamBuffers.WritableStreamBuffer();

sourceStream
  .pipe(ss)
  .pipe(writableStream)
  .once('close', function () {
    var str = writableStream.getContentsAsString('utf8');
    console.log('First 5 bytes piped:', "'" + str + "'");
    sourceStream.destroy();
  });

//Output
//Piped data before pattern occurs: 'Hello'