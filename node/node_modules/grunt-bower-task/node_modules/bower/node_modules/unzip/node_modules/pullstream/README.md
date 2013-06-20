pullstream [![Build Status](https://travis-ci.org/nearinfinity/node-pullstream.png)](https://travis-ci.org/nearinfinity/node-pullstream)
==========

Tired of getting a firehose worth of data from your streams. This module is here to save the day. PullStream allows
you to pull data when you want and as much as you want.

## Quick Examples

```javascript
var PullStream = require('pullstream');
var fs = require('fs');

var ps = new PullStream();
var loremIpsumStream = fs.createReadStream('loremIpsum.txt');
var outputStream = fs.createWriteStream(path.join(__dirname, 'loremIpsum.out'));

loremIpsumStream.pipe(ps);

// pull 5 bytes
ps.pull(5, function(err, data) {
  console.log(data.toString('utf8'));

  //synchronously pull 1000 bytes or howevery many bytes are available
  var bytes = ps.pullUpTo(1000);

  // pipe the next 100 to a file
  ps.pipe(100, outputStream).on('end', function () {
    console.log('all done');
  });
});
```

# API Index

## PullStream
 * [pull](#pullStreamPull)
 * [pullUpTo](#pullStreamPullUpTo)
 * [pipe](#pullStreamPipe)
 * [drain](#pullStreamDrain)
 * [write](#pullStreamWrite)
 * [end](#pullStreamEnd)
 * [prepend](#pullStreamPrepend)

# API Documentation

<a name="pullStream"/>
## PullStream

<a name="pullStreamPull" />
### ps.pull([number], callback)

Calls a callback when the specified number of bytes are ready. If no number is specified pull will read until the end
of the input stream.

__Arguments__

* number (optional) - Number of bytes to wait for. If not specified reads to the end of input stream.
* callback(err, data) - Callback called when the bytes are ready. data is a buffer containing the bytes.

__Example__

```javascript
var ps = new PullStream();

ps.pull(5, function(err, data) {
  console.log(data.toString('utf8'));
});
```

<a name="pullStreamPullUpTo" />
### ps.pullUpTo([number])

Synchronously returns the specified number of bytes or however many bytes are available from the input stream. If no
number is specified pullUpTo will return however many bytes are available from the input stream.

__Arguments__

* number (optional) - Number of bytes to read from the input stream.

__Example__

```javascript
var ps = new PullStream();

var data = ps.pullUpTo(1000);
console.log(data.toString('utf8'));
```

<a name="pullStreamPipe" />
### ps.pipe([number], destStream)

Pipes the specified number of bytes to destStream. If a number is not specified pipe will pipe the remainder
of the input stream to destStream. Back-pressure is properly managed.

__Arguments__

* number (optional) - Number of bytes to pipe. If not specified pipe the rest of input stream.
* destStream - The stream to pipe data to.

__Returns__

Returns destStream.

__Example__

```javascript
var ps = new PullStream();
var outputStream = fs.createWriteStream(path.join(__dirname, 'loremIpsum.out'));

ps.pipe(100, out).on('end', function() {
  console.log('done with pipe');
});
```

<a name="pullStreamDrain" />
### ps.drain(number, callback)

Consume the specified number of bytes and send them to nowhere. Also drains from upstream as necessary if the specified
number of bytes is less than the length of the pull stream's internal buffer.

__Example__

```javascript
var ps = new PullStream();

ps.drain(5, function(err) {
  console.log('5 bytes removed from pull stream');
});
```

<a name="pullStreamWrite" />
### ps.write(data, [encoding])

Writes data to input side of a pull stream.

__Arguments__

* data - Buffer or string to write to the input side of the pull stream.
* encoding (optional) - Encoding to use if data is a string. If not specified 'utf8' is used.

__Example__

```javascript
var ps = new PullStream();

ps.pull(5, function(err, data) {
  console.log(data.toString('ascii'));
});

ps.write('Hello World', 'ascii');
```

<a name="pullStreamEnd" />
### ps.end()

Manually ends a pull stream.

__Example__

```javascript
var ps = new PullStream();

ps.pull(5, function(err, data) {
  console.log(data.toString('utf8'));
});

ps.write('Hello World');
ps.end();
```

<a name="pullStreamPrepend" />
### ps.prepend()

Writes data to the front of the input side of a pull stream.

__Example__

```javascript
var ps = new PullStream();

ps.pull(11, function(err, data) {
  console.log(data.toString());
});

ps.write('World');
ps.prepend('Hello ');
ps.end();
```

## License

(The MIT License)

Copyright (c) 2012 - 2013 Near Infinity Corporation

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

