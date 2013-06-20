var test = require('tap').test;
var streamBuffers = require("stream-buffers");
var MatchStream = require('../');

test("pipe until pattern", function (t) {
  t.plan(2);

  var ms = new MatchStream({ pattern: 'World'}, function (buf, matched, extra) {
    if (!matched) {
      return this.push(buf);
    }
    this.push(buf);
    t.equal(extra.toString(), 'World');
    return this.push(null); //end the stream
  });

  var sourceStream = new streamBuffers.ReadableStreamBuffer();
  sourceStream.put("Hello World");
  var writableStream = new streamBuffers.WritableStreamBuffer();

  sourceStream
    .pipe(ms)
    .pipe(writableStream)
    .once('close', function () {
      var str = writableStream.getContentsAsString('utf8');
      t.equal(str, 'Hello ');
      sourceStream.destroy();
      t.end();
    });
});