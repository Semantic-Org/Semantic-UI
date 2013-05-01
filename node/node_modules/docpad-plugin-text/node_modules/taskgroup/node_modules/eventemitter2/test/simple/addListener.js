
var simpleEvents = require('nodeunit').testCase;
var file = '../../lib/eventemitter2';

if(typeof require !== 'undefined') {
  EventEmitter2 = require(file).EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

module.exports = simpleEvents({

  '1. Add a single listener on a single event.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    test.equal(emitter.listeners('test1').length, 1, 'There are three emitters');

    test.expect(1);
    test.done();

  },
  '2. Add two listeners on a single event.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    test.equal(emitter.listeners('test1').length, 2, 'There are three emitters');

    test.expect(1);
    test.done();

  },
  '3. Add three listeners on a single event.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners('test1').length, 3, 'There are three emitters');

    test.expect(1);
    test.done();

  },
  '4. Add two listeners to two different events.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on('test2', function () {
      test.ok(true, 'The event was raised');
    });

    emitter.on('test2', function () {
      test.ok(true, 'The event was raised');
    });

    test.equal(emitter.listeners('test1').length, 2, 'There are two emitters');
    test.equal(emitter.listeners('test2').length, 2, 'There are two emitters');

    test.expect(2);
    test.done();

  },
  '5. Never adding any listeners should yield a listeners array with the length of 0.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    emitter.on('test1', function () {
      test.ok(true, 'The event was raised');
    });

    test.equal(emitter.listeners('test2').length, 0, 'There are no emitters');

    test.expect(1);
    test.done();
  },

  '6. the listener added should be the right listener.': function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    var type = 'somelistenerbar';
    var f = function () {};

    emitter.on(type, f);
    test.equal(emitter.listeners(type).length, 1, 'There are is one emitters');
    test.equal(emitter.listeners(type)[0], f, 'The function should be f');

    test.expect(2);
    test.done();

  },

  '7. should be able to listen on any event' : function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    var f = function () {
      test.ok(true, 'the event was fired');
    };

    emitter.onAny(f);
    emitter.emit('test23.ns5.ns5', 'someData'); //1
    emitter.offAny(f);
    emitter.emit('test21'); //0
    emitter.onAny(f);
    emitter.onAny(f);
    emitter.emit('test23.ns5.ns5', 'someData'); //3

    test.expect(3);
    test.done();

  },

  '8. should be able to listen on any event (should cause an error)' : function (test) {

    var emitter = new EventEmitter2({ verbose: true });

    var f = function () {
      test.ok(true, 'the event was fired');
    };
    emitter.onAny(f);

    emitter.emit('error');

    test.expect(1);
    test.done();

  },

  '9. onAny alias' : function (test) {
    
    var emitter = new EventEmitter2({ verbose: true });

    var f = function () {
      test.ok(true, 'the event was fired');
    };
    
    emitter.on(f);

    emitter.emit('foo');
    emitter.emit('bar');

    test.expect(2);
    test.done();

  }
});
