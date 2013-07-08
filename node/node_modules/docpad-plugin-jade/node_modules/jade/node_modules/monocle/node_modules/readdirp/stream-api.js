var Stream = require('stream');

function createStreamAPI () {
  var stream
    , processEntry
    , done
    , handleError
    , handleFatalError
    , paused = true
    , controlled = false
    , buffer = []
    , closed = false
    ;

  stream = new Stream();
  stream.writable = false;
  stream.readable = true;

  stream.pause = function () {
    controlled = true;
    paused = true;
  };

  stream.resume = function () {
    controlled = true;
    paused = false;
    
    // emit all buffered entries, errors and ends
    while (!paused && buffer.length) {
      var msg = buffer.shift();
      this.emit(msg.type, msg.data);
    }
  };

  stream.destroy = function () {
    closed = true;
    stream.readable = false;
    stream.emit('close');
  };

  // called for each entry
  processEntry = function (entry) {
    if (closed) return;
    return paused ? buffer.push({ type: 'data', data: entry }) : stream.emit('data', entry);
  };

  // called with all found entries when directory walk finished
  done = function (err, entries) {
    if (closed) return;
    
    // since we already emitted each entry and all non fatal errors
    // all we need to do here is to signal that we are done
    stream.emit('end');
  };

  handleError = function (err) {
    if (closed) return;
    return paused ? buffer.push({ type: 'warn', data: err }) : stream.emit('warn', err);
  };

  handleFatalError = function (err) {
    if (closed) return;
    return paused ? buffer.push({ type: 'error', data: err }) : stream.emit('error', err);
  };

  // Allow stream to be returned and handlers to be attached and/or stream to be piped before emitting messages
  // Otherwise we may loose data/errors that are emitted immediately
  process.nextTick(function () { 
    if (closed) return;
    
    // In case was controlled (paused/resumed) manually, we don't interfer
    // see https://github.com/thlorenz/readdirp/commit/ab7ff8561d73fca82c2ce7eb4ce9f7f5caf48b55#commitcomment-1964530
    if (controlled) return;
    stream.resume(); 
  });

  return { 
      stream           :  stream
    , processEntry     :  processEntry
    , done             :  done
    , handleError      :  handleError
    , handleFatalError :  handleFatalError
  };
}

module.exports = createStreamAPI;
