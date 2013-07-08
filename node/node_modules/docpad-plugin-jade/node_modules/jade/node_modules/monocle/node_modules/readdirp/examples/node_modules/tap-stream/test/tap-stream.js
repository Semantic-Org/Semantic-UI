'use strict';
/*jshint asi: true */

var test = require('tap').test
  , Stream = require('stream')
  , tap = require('..')
  , through = require('through');

function objectStream () {
  var s = new Stream()
    , objects = 0;
 
  var iv = setInterval(
      function () {
        s.emit('data', { id: objects, created: new Date() });

        if (++objects === 2) {
            s.emit('end');
            clearInterval(iv);
        }
      }
    , 20);
  return s;
}

test('tapping object stream that emits 2 objects', function (t) {
  var logged = []
    , piped = [];

  function log (data) {
    logged.push(data);
  }

  t.plan(4);

  objectStream()
    .pipe(tap(log))
    .pipe(through(
        function write (data) {
          piped.push(data);
          this.emit('data', data);
        }
      , function end (data) {

          t.equals(0, logged[0].id, 'logs first item');
          t.equals(1, logged[1].id, 'logs second item');

          t.equals(0, piped[0].id, 'pipes first item');
          t.equals(1, piped[1].id, 'pipes second item');

          t.end();
          
          this.emit('end');
        }
    ))
})

/* The below doesn't work since pipe only writes one argument:
 *    https://github.com/joyent/node/blob/master/lib/stream.js#L36
 *
 * Since it uses EventEmitter whose 'emit' supports multiple args, this may change in the future - I hope so.
 * Until then ...
 */
var onDataInsidePipeWritesMultipleArgs = false;

if (! onDataInsidePipeWritesMultipleArgs) return;

function numberStream () {
  var s = new Stream();
 
  setTimeout(
      function () {
        s.emit('data', 1, 2);
        s.emit('end');
      }
    , 20);
  return s;
}

test('tapping stream that emits a number and a string one time', function (t) {
  var logged = []
    , piped = [];

  function log (n1, n2) {
    logged.push({ n1: n1, n2: n2 });
  }

  t.plan(2);

  numberStream()
    .pipe(tap(log))
    .pipe(through(
        function write (n1, n2) {
          piped.push({ n1: n1, n2: n2 });
        }
      , function end () {
          t.equals({ n1: 1, n2: 2 }, logged[0], 'logs both numbers');
          t.equals({ n1: 1, n2: 2 }, piped[0], 'pipes both numbers');
          t.end();
          
          this.emit('end');
        }
    ))
})
