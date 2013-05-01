var simpleEvents= require('nodeunit').testCase;
var file = '../../lib/eventemitter2';

var EventEmitter2;

if(typeof require !== 'undefined') {
  EventEmitter2 = require(file).EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

module.exports = simpleEvents({

  '1. add a single event and then remove the event.' : function (test) {
    
    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should only have 1');

    //remove
    emitter.removeListener(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(2);
    test.done();
  },

  '2. Add two events and then remove only one of those events.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function f() {
      test.ok(true, 'event was raised');
    };

    emitter.on(type, f);
    emitter.on(type, f);
    
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 2, 'should only have 2');

    emitter.removeListener(type, f);

    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should be 1');

    test.expect(2);
    test.done();
  },

  '3. Add three events and remove only one of the events that was added.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type, f);
    emitter.on(type, f);
    emitter.on(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 3, 'should only have 3');

    //remove
    emitter.removeListener(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 2, 'should be 2');

    test.expect(2);
    test.done();
  },

  '4. Should error if we don\'t pass a function to the emit method.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should only have 1');

    //remove
    test.throws(function () {emitter.removeListener(type, type)}, Error, 'should throw an Error');
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should be 1');

    test.expect(3);
    test.done();
  },

  '5. Removing one listener should not affect another listener.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };
    var g = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should only have 1');

    //remove
    emitter.removeListener(type, g);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 1, 'should be 1');

    test.expect(2);
    test.done();
  },

  '6. Remove all listener functions.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };
    for (var i = 0; i < 10; i++) {
      emitter.on(type, f);
    }

    listeners = emitter.listeners(type);
    test.equal(listeners.length, 10, 'should only have 10');

    emitter.removeListener(type, f);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 9, 'should be 9');
    emitter.removeAllListeners(type);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(3);
    test.done();
  },

  '7. Removing listeners for one event should not affect another event\'s listeners.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type = 'remove.foo.bar';
    
    var listeners;
    
    var f = function () {
      test.ok(true, 'event was raised');
    };

    for (var i = 0; i < 10; i++) {
      emitter.on(type, f);
    }

    listeners = emitter.listeners(type);
    test.equal(listeners.length, 10, 'should only have 10');

    emitter.removeListener(type+type, f);

    listeners = emitter.listeners(type);
    test.equal(listeners.length, 10, 'should be 10');

    emitter.removeAllListeners(type+type);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 10, 'should be 10');
    
    emitter.removeAllListeners(type+'.'+type);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 10, 'should be 10');

    emitter.removeAllListeners(type);
    listeners = emitter.listeners(type);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(5);
    test.done();
  },

  '8. Its ok to listen on wildcard, so it is ok to remove it.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type1 = '*.wild.card',
        type2 = 'just.another.event',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type2, f);
    emitter.on(type1, f);

    //remove
    emitter.removeListener(type1, f);
    listeners = emitter.listeners(type1);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(1);
    test.done();
  },

  '9. And (8) should not depend on order of listening.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type1 = '*.wild.card',
        type2 = 'just.another.event',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type1, f);
    emitter.on(type2, f);

    //remove
    emitter.removeListener(type1, f);
    listeners = emitter.listeners(type1);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(1);
    test.done();
  },

  '10. Reporting many listeners on wildcard all should removed.' : function (test) {

    var emitter = new EventEmitter2({
      wildcard : true,
      verbose : true
    });

    var type1 = '*.wild.card',
        type2 = 'exact.wild.card',
        listeners;

    var f = function () {
      test.ok(true, 'event was raised');
    };

    emitter.on(type1, f);
    emitter.on(type2, f);

    // check number of listeners by wild card
    listeners = emitter.listeners(type1);
    test.equal(listeners.length, 2, 'should only have 2');

    // remove by wild card should remove both
    emitter.removeListener(type1, f);
    listeners = emitter.listeners(type1);
    test.equal(listeners.length, 0, 'should be 0');

    test.expect(2);
    test.done();
  }


});
