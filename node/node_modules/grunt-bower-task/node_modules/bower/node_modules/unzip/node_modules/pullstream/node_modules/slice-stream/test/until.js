var test = require('tap').test;
var streamBuffers = require("stream-buffers");
var SliceStream = require('../');

test("pipe a fixed length number of bytes, then end the stream", function (t) {
  t.plan(2);

  var ss = new SliceStream({ length: 5}, function (buf, sliceEnd, extra) {
    if (!sliceEnd) {
      return this.push(buf);
    }
    this.push(buf);
    t.equal(extra.toString(), ' World');
    return this.push(null);
  });

  var sourceStream = new streamBuffers.ReadableStreamBuffer();
  sourceStream.put("Hello World");
  var writableStream = new streamBuffers.WritableStreamBuffer();

  sourceStream
    .pipe(ss)
    .pipe(writableStream)
    .once('close', function () {
      var str = writableStream.getContentsAsString('utf8');
      t.equal(str, 'Hello');
      sourceStream.destroy();
      t.end();
    });
});