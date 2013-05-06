# readable-stream

    Stability: 1 - Experimental

A new kind of readable streams for Node.js

This is an abstract class designed to be extended.  It also provides a
`wrap` method that you can use to provide the simpler readable API for
streams that have the "readable stream" interface of Node 0.8 and
before.

Note that Duplex, Transform, Writable, and PassThrough streams are also
provided as base classes.  See the full API details below.

## Justification

<!-- misc -->

Writable streams in node are relatively straightforward to use and
extend.  The `write` method either returns `false` if you would like
the user to back off a bit, in which case a `drain` event at some
point in the future will let them continue writing, or anything other
than false if the bytes could be completely handled and another
`write` should be performed, or   The `end()` method lets the user
indicate that no more bytes will be written.  That's pretty much the
entire required interface for writing.

However, readable streams in Node 0.8 and before are rather
complicated.

1. The `data` events start coming right away, no matter what.  There
   is no way to do other actions before consuming data, without
   handling buffering yourself.
2. If you extend the interface in userland programs, then you must
   implement `pause()` and `resume()` methods, and take care of
   buffering yourself.
3. In many streams, `pause()` was purely advisory, so **even while
   paused**, you still have to be careful that you might get some
   data.  This caused a lot of subtle b ugs.

So, while writers only have to implement `write()`, `end()`, and
`drain`, readers have to implement (at minimum):

* `pause()` method
* `resume()` method
* `data` event
* `end` event

And read consumers had to always be prepared for their backpressure
advice to simply be ignored.

If you are using a readable stream, and want to just get the first 10
bytes, make a decision, and then pass the rest off to somewhere else,
then you have to handle buffering, pausing, slicing, and so on.  This
is all rather brittle and easy to get wrong for all but the most
trivial use cases.

Additionally, this all made the `reader.pipe(writer)` method
unnecessarily complicated and difficult to extend without breaking
something.  Backpressure and error handling is especially challenging
and brittle.

### Solution

<!-- misc -->

The reader does not have pause/resume methods.  If you want to consume
the bytes, you call `read()`.  If bytes are not being consumed, then
effectively the stream is in a paused state.  It exerts backpressure
on upstream connections, doesn't read from files, etc.  Any data that
was already in the process of being read will be placed in a buffer.

If `read()` returns `null`, then a future `readable` event will be
fired when there are more bytes ready to be consumed.

This is simpler and conceptually closer to the underlying mechanisms.
The resulting `pipe()` method is much shorter and simpler.  The
problems of data events happening while paused are alleviated.

### Compatibility

<!-- misc -->

It's not particularly difficult to wrap old-style streams in this
new interface, or to wrap this type of stream in the old-style
interface.

The `Readable` class provides a `wrap(oldStream)` method that takes an
argument which is an old-style stream with `data` events and `pause()`
and `resume()` methods, and uses that as the data source.  For
example:

```javascript
var r = new Readable();
r.wrap(oldReadableStream);

// now you can use r.read(), and it will emit 'readable' events
// but the data is based on whatever oldReadableStream spits out of
// its 'data' events.
```

In order to work with programs that use the old interface, some
magic is unfortunately required.  At some point in the future, this
magic will be removed.

The `Readable` class will automatically convert into an old-style
`data`-emitting stream if any listeners are added to the `data` event.
So, this works fine, though you of course lose a lot of the benefits of
the new interface:

```javascript
var r = new ReadableThing();

r.on('data', function(chunk) {
  // ...
  // magic is happening!  oh no!  the animals are walking upright!
  // the brooms are sweeping the floors all by themselves!
});

// this will also turn on magic-mode:
r.pause();

// now pause, resume, etc. are patched into place, and r will
// continually call read() until it returns null, emitting the
// returned chunks in 'data' events.

r.on('end', function() {
  // ...
});
```

## Class: Readable

A base class for implementing Readable streams.  Override the
`_read(n,cb)` method to fetch data asynchronously and take advantage
of the buffering built into the Readable class.

### Example

Extend the Readable class, and provide a `_read(n,cb)` implementation
method.

```javascript
var Readable = require('readable-stream');
var util = require('util');

util.inherits(MyReadable, Readable);

function MyReadable(options) {
  Readable.call(this, options);
}

MyReadable.prototype._read = function(n, cb) {
  // your magic goes here.
  // call the cb at some time in the future with either up to n bytes,
  // or an error, like cb(err, resultData)
  //
  // The code in the Readable class will call this to keep an internal
  // buffer at a healthy level, as the user calls var chunk=stream.read(n)
  // to consume chunks.
};

var r = new MyReadable();

r.on('end', function() {
  // no more bytes will be provided.
});

r.on('readable', function() {
  // now is the time to call read() again.
});

// to get some bytes out of it:
var data = r.read(optionalLengthArgument);
// now data is either null, or a buffer of optionalLengthArgument
// length.  If you don't provide an argument, then it returns whatever
// it has.

// typically you'd just r.pipe() into some writable stream, but you
// can of course do stuff like this, as well:
function flow() {
  var chunk;
  while (null !== (chunk = r.read())) {
    doSomethingWithData(chunk);
  }
  r.once('readable', flow);
}
flow();
```

### new Readable(options)

* `options` {Object}
  * `lowWaterMark` {Number} The minimum number of bytes before the
    stream is considered 'readable'.  Default = `0`
  * `bufferSize` {Number} The number of bytes to try to read from the
    underlying `_read` function.  Default = `16 * 1024`

Make sure to call the `Readable` constructor in your extension
classes, or else the stream will not be properly initialized.

### readable.read([size])

* `size` {Number} Optional number of bytes to read.  If not provided,
  then return however many bytes are available.
* Returns: {Buffer | null}

Pulls the requested number of bytes out of the internal buffer.  If
that many bytes are not available, then it returns `null`.

### readable.\_read(size, callback)

* `size` {Number} Number of bytes to read from the underlying
  asynchronous data source.
* `callback` {Function} Callback function
  * `error` {Error Object}
  * `data` {Buffer | null}

**Note: This function is not implemented in the Readable base class.**
Rather, it is up to you to implement `_read` in your extension
classes.

`_read` should fetch the specified number of bytes, and call the
provided callback with `cb(error, data)`, where `error` is any error
encountered, and `data` is the returned data.

This method is prefixed with an underscore because it is internal to
the class that defines it, and should not be called directly by user
programs.  However, you **are** expected to override this method in
your own extension classes.

The `size` argument is purely advisory.  You may call the callback
with more or fewer bytes.  However, if you call the callback with
`null`, or an empty buffer, then it will assume that the end of the
data was reached.

### readable.pipe(destination)

* `destination` {Writable Stream object}

Continually `read()` data out of the readable stream, and `write()` it
into the writable stream.  When the `writable.write(chunk)` call
returns `false`, then it will back off until the next `drain` event,
to do backpressure.

Piping to multiple destinations is supported.  The slowest destination
stream will limit the speed of the `pipe()` flow.

Note that this puts the readable stream into a state where not very
much can be done with it.  You can no longer `read()` from the stream
in other code, without upsetting the pipe() process.  However, since
multiple pipe destinations are supported, you can always create a
`PassThrough` stream, and pipe the reader to that.  For example:

```
var r = new ReadableWhatever();
var pt = new PassThrough();

r.pipe(someWritableThing);
r.pipe(pt);

// now I can call pt.read() to my heart's content.
// note that if I *don't* call pt.read(), then it'll back up and
// prevent the pipe() from flowing!
```

### readable.unpipe([destination])

* `destination` {Writable Stream object} Optional

Remove the provided `destination` stream from the pipe flow.  If no
argument is provided, then it will unhook all piped destinations.

### readable.on('readable')

An event that signals more data is now available to be read from the
stream.  Emitted when more data arrives, after previously calling
`read()` and getting a null result.

### readable.on('end')

An event that signals that no more data will ever be available on this
stream.  It's over.

### readable.\_readableState

* {Object}

An object that tracks the state of the stream.  Buffer information,
whether or not it has reached the end of the underlying data source,
etc., are all tracked on this object.

You are strongly encouraged not to modify this in any way, but it is
often useful to read from.

## Class: Writable

A base class for creating Writable streams.  Similar to Readable, you
can create child classes by overriding the asynchronous
`_write(chunk,cb)` method, and it will take care of buffering,
backpressure, and so on.

### new Writable(options)

* `options` {Object}
  * `highWaterMark` {Number} The number of bytes to store up before it
    starts returning `false` from write() calls.  Default = `16 * 1024`
  * `lowWaterMark` {Number} The number of bytes that the buffer must
    get down to before it emits `drain`.  Default = `1024`

Make sure to call the `Writable` constructor in your extension
classes, or else the stream will not be properly initialized.

### writable.write(chunk, [encoding])

* `chunk` {Buffer | String}
* `encoding` {String} An encoding argument to turn the string chunk
  into a buffer.  Only relevant if `chunk` is a string.
  Default = `'utf8'`.
* Returns `false` if you should not write until the next `drain`
  event, or some other value otherwise.

The basic write function.

### writable.\_write(chunk, callback)

* `chunk` {Buffer}
* `callback` {Function}
  * `error` {Error | null} Call with an error object as the first
    argument to indicate that the write() failed for unfixable
    reasons.

**Note: This function is not implemented in the Writable base class.**
Rather, it is up to you to implement `_write` in your extension
classes.

`_write` should do whatever has to be done in this specific Writable
class, to handle the bytes being written.  Write to a file, send along
a socket, encrypt as an mp3, whatever needs to be done.  Do your I/O
asynchronously, and call the callback when it's complete.

This method is prefixed with an underscore because it is internal to
the class that defines it, and should not be called directly by user
programs.  However, you **are** expected to override this method in
your own extension classes.

### writable.end([chunk], [encoding])

* `chunk` {Buffer | String}
* `encoding` {String}

If a chunk (and, optionally, an encoding) are provided, then that
chunk is first passed to `this.write(chunk, encoding)`.

This method is a way to signal to the writable stream that you will
not be writing any more data.  It should be called exactly once for
every writable stream.

Calling `write()` *after* calling `end()` will trigger an error.

### writable.on('pipe', source)

Emitted when calling `source.pipe(writable)`.  See above for the
description of the `readable.pipe()` method.

### writable.on('unpipe', source)

Emitted when calling `source.unpipe(writable)`.  See above for the
description of the `readable.unpipe()` method.

### writable.on('drain')

If a call to `writable.write()` returns false, then at some point in
the future, this event will tell you to start writing again.

### writable.on('finish')

When the stream has been ended, and all the data in its internal
buffer has been consumed, then it emits a `finish` event to let you
know that it's completely done.

This is particularly handy if you want to know when it is safe to shut
down a socket or close a file descriptor.  At this time, the writable
stream may be safely disposed.  Its mission in life has been
accomplished.

## Class: Duplex

A base class for Duplex streams (ie, streams that are both readable
and writable).

Since JS doesn't have multiple prototypal inheritance, this class
prototypally inherits from Readable, and then parasitically from
Writable.  It is thus up to the user to implement both the lowlevel
`_read(n,cb)` method as well as the lowlevel `_write(chunk,cb)`
method on extension duplex classes.

For cases where the written data is transformed into the output, it
may be simpler to use the `Transform` class instead.

### new Duplex(options)

* `options` {Object}  Passed to both the Writable and Readable
  constructors.

Make sure to call the `Duplex` constructor in your extension
classes, or else the stream will not be properly initialized.

If `options.allowHalfOpen` is set to the value `false`, then the
stream will automatically end the readable side when the writable
side ends, and vice versa.

### duplex.allowHalfOpen

* {Boolean} Default = `true`

Set this flag to either `true` or `false` to determine whether or not
to automatically close the writable side when the readable side ends,
and vice versa.


## Class: Transform

A duplex (ie, both readable and writable) stream that is designed to
make it easy to implement transform operations such as encryption,
decryption, compression, and so on.

Transform streams are `instanceof` Readable, but they have all of the
methods and properties of both Readable and Writable streams.  See
above for the list of events and methods that Transform inherits from
Writable and Readable.

Override the `_transform(chunk, outputFunction, callback)` method in
your implementation classes to take advantage of it.

### new Transform(options)

* `options` {Object}  Passed to both the Writable and Readable
  constructors.

Make sure to call the `Transform` constructor in your extension
classes, or else the stream will not be properly initialized.

### transform.\_transform(chunk, outputFn, callback)

* `chunk` {Buffer} The chunk to be transformed.
* `outputFn` {Function} Call this function with any output data to be
  passed to the readable interface.
* `callback` {Function} Call this function (optionally with an error
  argument) when you are done processing the supplied chunk.

**Note: This function is not implemented in the Transform base class.**
Rather, it is up to you to implement `_transform` in your extension
classes.

`_transform` should do whatever has to be done in this specific
Transform class, to handle the bytes being written, and pass them off
to the readable portion of the interface.  Do asynchronous I/O,
process things, and so on.

Call the callback function only when the current chunk is completely
consumed.  Note that this may mean that you call the `outputFn` zero
or more times, depending on how much data you want to output as a
result of this chunk.

This method is prefixed with an underscore because it is internal to
the class that defines it, and should not be called directly by user
programs.  However, you **are** expected to override this method in
your own extension classes.

### transform.\_flush(outputFn, callback)

* `outputFn` {Function} Call this function with any output data to be
  passed to the readable interface.
* `callback` {Function} Call this function (optionally with an error
  argument) when you are done flushing any remaining data.

**Note: This function is not implemented in the Transform base class.**
Rather, it is up to you to implement `_flush` in your extension
classes optionally, if it applies to your use case.

In some cases, your transform operation may need to emit a bit more
data at the end of the stream.  For example, a `Zlib` compression
stream will store up some internal state so that it can optimally
compress the output.  At the end, however, it needs to do the best it
can with what is left, so that the data will be complete.

In those cases, you can implement a `_flush` method, which will be
called at the very end, after all the written data is consumed, but
before emitting `end` to signal the end of the readable side.  Just
like with `_transform`, call `outputFn` zero or more times, as
appropriate, and call `callback` when the flush operation is complete.

This method is prefixed with an underscore because it is internal to
the class that defines it, and should not be called directly by user
programs.  However, you **are** expected to override this method in
your own extension classes.


## Class: PassThrough

This is a trivial implementation of a `Transform` stream that simply
passes the input bytes across to the output.  Its purpose is mainly
for examples and testing, but there are occasionally use cases where
it can come in handy.
