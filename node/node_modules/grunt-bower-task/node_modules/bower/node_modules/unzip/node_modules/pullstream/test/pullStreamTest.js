'use strict';

var nodeunit = require('nodeunit');
var fs = require("fs");
var path = require("path");
var streamBuffers = require("stream-buffers");
var async = require('async')
var PullStream = require('../');

module.exports = {
  "source sending 1-byte at a time": function (t) {
    t.expect(3);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('finish', function () {
      sourceStream.destroy();
    });

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      var writableStream = new streamBuffers.WritableStreamBuffer({
        initialSize: 100
      });
      writableStream.on('close', function () {
        var str = writableStream.getContentsAsString('utf8');
        t.equal(' World', str);

        ps.pull(function (err, data) {
          if (err) {
            return t.done(err);
          }
          t.equal('!', data.toString());
          return t.done();
        });
      });

      ps.pipe(' World'.length, writableStream);
    });
  },

  "source sending twelve bytes at once": function (t) {
    t.expect(3);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('finish', function () {
      sourceStream.destroy();
    });

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      var writableStream = new streamBuffers.WritableStreamBuffer({
        initialSize: 100
      });
      writableStream.on('close', function () {
        var str = writableStream.getContentsAsString('utf8');
        t.equal(' World', str);

        ps.pull(function (err, data) {
          if (err) {
            return t.done(err);
          }
          t.equal('!', data.toString());
          return t.done();
        });
      });

      ps.pipe(' World'.length, writableStream);
    });
  },

  "source sending 512 bytes at once": function (t) {
    t.expect(512 / 4);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('finish', function() {
      sourceStream.destroy();
    });

    var values = [];
    for (var i = 0; i < 512; i+=4) {
      values.push(i + 1000);
    }
    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    values.forEach(function(val) {
      sourceStream.put(val);
    });

    sourceStream.pipe(ps);

    async.forEachSeries(values, function (val, callback) {
      ps.pull(4, function (err, data) {
        if (err) {
          return callback(err);
        }
        t.equal(val, data.toString());
        return callback(null);
      });
    }, function (err) {
      t.done(err);
    });
  },

  "two length pulls": function (t) {
    t.expect(2);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('finish', function () {
      sourceStream.destroy();
    });

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      ps.pull(' World!'.length, function (err, data) {
        if (err) {
          return t.done(err);
        }
        t.equal(' World!', data.toString());
        return t.done();
      });
    });
  },

  "pulling zero bytes returns empty data": function (t) {
    t.expect(1);
    var ps = new PullStream({ lowWaterMark : 0 });

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull(0, function (err, data) {
      if (err) {
        return t.done(err);
      }

      t.equal(0, data.length, "data is empty");
      sourceStream.destroy();
      return t.done();
    });
  },

  "read from file": function (t) {
    t.expect(2);
    var ps = new PullStream({ lowWaterMark : 0 });

    var sourceStream = fs.createReadStream(path.join(__dirname, 'testFile.txt'));

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());

      ps.pull(' World!'.length, function (err, data) {
        if (err) {
          return t.done(err);
        }
        t.equal(' World!', data.toString());
        return t.done();
      });
    });
  },

  "read past end of stream": function (t) {
    t.expect(2);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('finish', function () {
      sourceStream.destroy();
    });

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello World!'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello World!', data.toString());

      ps.pull(1, function (err, data) {
        if (err) {
          t.ok(err, 'should get an error');
        }
        t.done();
      });
    });
  },

  "pipe with no length": function (t) {
    t.expect(2);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.on('end', function () {
      t.ok(true, "pullstream should end");
    });

    var writableStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 100
    });
    writableStream.on('close', function () {
      var str = writableStream.getContentsAsString('utf8');
      t.equal('Hello World!', str);
      t.done();
    });

    ps.pipe(writableStream);

    process.nextTick(function () {
      ps.write(new Buffer('Hello', 'utf8'));
      ps.write(new Buffer(' World', 'utf8'));
      process.nextTick(function () {
        ps.write(new Buffer('!', 'utf8'));
        ps.end();
      });
    });
  },

  "throw on calling write() after end": function (t) {
    t.expect(1);
    var ps = new PullStream({ lowWaterMark : 0 });
    ps.end();

    try {
      ps.write(new Buffer('hello', 'utf8'));
      t.fail("should throw error");
    } catch (ex) {
      t.ok(ex);
    }

    t.done();
  },

  "pipe more bytes than the pullstream buffer size": function (t) {
    t.expect(1);
    var ps = new PullStream();
    ps.on('end', function() {
      sourceStream.destroy();
    });

    var aVals = "", bVals = "";
    for (var i = 0; i < 20 * 1000; i++) {
      aVals += 'a';
    }
    for (var i = 0; i < 180 * 1000; i++) {
      bVals += 'b';
    }
    var combined = aVals + bVals;

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 40 * 1024
    });
    sourceStream.put(aVals);

    sourceStream.pipe(ps);

    var writableStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 200 * 1000
    });
    writableStream.on('close', function () {
      var str = writableStream.getContentsAsString('utf8');
      t.equal(combined, str);
      t.done();
    });

    ps.once('drain', function () {
      ps.pipe(200 * 1000, writableStream);
      process.nextTick(sourceStream.put.bind(null, bVals));
    });
  },

  "mix asynchronous pull with synchronous pullUpTo - exact number of bytes returned": function (t) {
    t.expect(2);
    var ps = new PullStream();

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());
      var data = ps.pullUpTo(" World!".length);
      t.equal(" World!", data.toString());
      sourceStream.destroy();
      t.done();
    });
  },

  "mix asynchronous pull with pullUpTo - fewer bytes returned than requested": function (t) {
    t.expect(2);
    var ps = new PullStream();

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());
      var data = ps.pullUpTo(1000);
      t.equal(" World!", data.toString());
      sourceStream.destroy();
      t.done();
    });
  },

  "retrieve all currently remaining bytes": function (t) {
    t.expect(2);
    var ps = new PullStream();

    var sourceStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 0,
      chunkSize: 1000
    });
    sourceStream.put("Hello World!");

    sourceStream.pipe(ps);

    ps.pull('Hello'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello', data.toString());
      var data = ps.pullUpTo();
      t.equal(" World!", data.toString());
      sourceStream.destroy();
      t.done();
    });
  },

  "prepend": function (t) {
    t.expect(1);
    var ps = new PullStream();

    var sourceStream = new streamBuffers.ReadableStreamBuffer();

    sourceStream.pipe(ps);
    sourceStream.put("World!");
    ps.prepend("Hello ");

    ps.pull('Hello World!'.length, function (err, data) {
      if (err) {
        return t.done(err);
      }
      t.equal('Hello World!', data.toString());
      sourceStream.destroy();
      t.done();
    });
  },

  "drain": function (t) {
    t.expect(1);
    var ps = new PullStream();

    var sourceStream = new streamBuffers.ReadableStreamBuffer();

    sourceStream.pipe(ps);
    sourceStream.put("Hello World!");

    ps.drain('Hello '.length, function (err) {
      if (err) {
        return t.done(err);
      }
      ps.pull('World!'.length, function (err, data) {
        t.equal('World!', data.toString());
        sourceStream.destroy();
        t.done();
      });
    });
  }
};
