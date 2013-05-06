var basicEvents = require('nodeunit').testCase;

var EventEmitter2;

if(typeof require !== 'undefined') {
  EventEmitter2 = require('../../lib/eventemitter2').EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

function setHelper (emitter, test, testName){
  var eventNames = [
    testName, 
    testName + '.*', 
    testName + '.ns1', 
    testName + '.ns1.ns2', 
    testName + '.ns2.*'
  ];

  for (var i = 0; i < eventNames.length; i++) {
    emitter.on(eventNames[i], function () { 
        test.ok(true, eventNames[i] + 'has fired');
    });
  }

  return eventNames;
};

module.exports = basicEvents({

  '1. An event can be namespaced.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test1.ns1', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.emit('test1.ns1');
    
    test.expect(1);
    test.done();

  },
  '2. An event can be namespaced and accept values.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test2.ns1', function(value1) {
      test.ok(true, 'The event was raised');
      test.ok(typeof value1 !== 'undefined', 'The event was raised with the value `' + value1 + '`.');
    });
    
    emitter.emit('test2.ns1', 1);
    
    test.expect(2);
    test.done();    

  },
  '3. A namespaced event can be raised multiple times and accept values.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test3.ns1', function (value1, value2, value3) {
       test.ok(true, 'The event was raised');
       test.ok(arguments.length === 3, 'The event was raised with the correct number of arguments');
       test.ok(value1 === 1 || value1 === 4, 'The event was raised with the value `' + value1 + '`.');
       test.ok(value2 === 2 || value2 === 5, 'The event was raised with the value `' + value2 + '`.');
       test.ok(value3 === 3 || value3 === 6, 'The event was raised with the value `' + value3 + '`.');            
    });
    
    emitter.emit('test3.ns1', 1, 2, 3);
    emitter.emit('test3.ns1', 4, 5, 6);
    
    test.expect(10);
    test.done();
  },    
  '4. A listener should support wild cards.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test4.*', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.emit('test4.ns1');
    
    test.expect(1);
    test.done();

  },
  '5. Emitting an event should support wildcards.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test5A.test5B', function () {
      test.ok(true, 'The event was raised');
    });

    emitter.emit('test5A.*');

    test.expect(1);
    test.done();

  },
  '6. A listener should support complex wild cards.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test10.*.foo', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.emit('test10.ns1.foo');
    
    test.expect(1);
    test.done();    

  },
  '7. Emitting an event should support complex wildcards.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test11.ns1.foo', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.emit('test11.*.foo');
    
    test.expect(1);
    test.done();    

  },
  '8. Emitting an event should support complex wildcards multiple times, a valid listener should accept values.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test12.ns1.ns2', function (value1, value2, value3) {
      test.ok(true, 'The event was raised');
      test.ok(arguments.length === 3, 'The event was raised with the correct number of arguments');
      test.ok(value1 === 1 || value1 === 4, 'The event was raised with the value `' + value1 + '`.');
      test.ok(value2 === 2 || value2 === 5, 'The event was raised with the value `' + value1 + '`.');
      test.ok(value3 === 3 || value3 === 6, 'The event was raised with the value `' + value1 + '`.');            
    });
    
    emitter.emit('test12.*.ns2', 1, 2, 3);
    emitter.emit('test12.*.ns2', 4, 5, 6);
    
    test.expect(10);
    test.done();
    
  },
  '9. List all the listeners for a particular event.': function(test) {

    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    emitter.on('test13', function (event) {
      test.ok(true,'raised one');
    });

    emitter.on('test13', function (event) {
      test.ok(true,'raised two');
    });

    var listeners = emitter.listeners('test13');

    test.ok(listeners.length === 2, 'The event `test13` should have 2 listeners');
    test.expect(1);
    test.done();

  },
  '10. should be able to listen on any event' : function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    var fn = function (foo, bar) {
      test.equal(this.event, 'test23.ns5.ns5')
      test.equal(foo, 'foo');
      test.equal(bar, 1);
      test.ok(true, 'raised test23.ns5.ns5');
    }
    
    emitter.onAny(fn);
    emitter.emit('test23.ns5.ns5', 'foo', 1);
    test.expect(4);
    test.done();

  },
  
  '11. No warning should be raised if we set maxListener to be greater before adding' : function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true,
      verbose: true
    });

    var type = 'test29.*';

    // set to 20
    emitter.setMaxListeners(20);

    for (var i = 0; i < 15 ; i++) {
      emitter.on(type, function () {
        test.ok(true, 'event was raised');
      });
    }

    var listeners = emitter.listeners(type);
    test.equal(listeners.length, 15, 'should have 15');
    test.ok(!(emitter.listenerTree[ 'test29' ]['*']._listeners.warned), 'should not have been set');

    test.expect(2);
    test.done();
  }

 
});
