
var simpleEvents = require('nodeunit').testCase;
var file = '../../lib/eventemitter2';

var EventEmitter2;

if(typeof require !== 'undefined') {
  EventEmitter2 = require(file).EventEmitter2;
}
else {
  EventEmitter2 = window.EventEmitter2;
}

module.exports = simpleEvents({

  '1. Add a single listener on a single event.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';

    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners(type).length, 1, 'There are three emitters');
    
    test.expect(1);
    test.done();

  },
  
  '1a. Add a single listener on a single event (using an array).': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = ['some', 'listener', 'bar'];

    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });

    test.equal(emitter.listeners(type).length, 1, 'There are three emitters');
    
    test.expect(1);
    test.done();

  },

  '2. Add two listeners on a single event.': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners(type).length, 2, 'There are three emitters');
    
    test.expect(1);
    test.done();

  },
  
  '2a. Add two listeners on a single event (using an array).': function (test) {
    
    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = ['some', 'listener', 'bar'];
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners(type).length, 2, 'There are three emitters');
    
    test.expect(1);
    test.done();

  },  
  
  '3. Add three listeners on a single event.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners(type).length, 3, 'There are three emitters');
    
    test.expect(1);
    test.done();

  },
  
  '4. Add two listeners to two different events.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on('test2', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.on('test2', function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners(type).length, 2, 'There are two emitters');
    test.equal(emitter.listeners('test2').length, 2, 'There are two emitters');
    
    test.expect(2);
    test.done();
  },

  '5. Never adding any listeners should yield a listeners array with the length of 0.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';
    
    emitter.on(type, function () {
      test.ok(true, 'The event was raised');
    });
    
    test.equal(emitter.listeners('test2').length, 0, 'There are no emitters');
    
    test.expect(1);
    test.done();
  },

  '6. the listener added should be the right listener.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var type = 'some.listener.bar';
    var f = function () {};
    
    emitter.on(type, f);
    test.equal(emitter.listeners(type).length, 1, 'There are is one emitters');
    test.equal(emitter.listeners(type)[0], f, 'The function should be f');
    
    test.expect(2);
    test.done();

  },
  
  '7. Listeners on `*`, `*.*`, `*.test` with emissions from `foo.test` and `other.emit`': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var f = function () {
      test.ok(true, 'the event was fired')
    };

    emitter.on('*.test', f);
    emitter.on('*.*', f);
    emitter.on('*', f);

    emitter.emit('other.emit');    
    emitter.emit('foo.test');
    
    test.expect(3);
    test.done();
  },
  
  '8. Listeners on `*`, `*.*`, foo.test with emissions from `*`, `*.*` and `foo.test`': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var f = function () {
      test.ok(true, 'the event was fired')
    };

    emitter.on('foo.test', f);
    emitter.on('*.*', f);
    emitter.on('*', f);

    emitter.emit('*.*');    
    emitter.emit('foo.test');
    emitter.emit('*')
    
    test.expect(5);
    test.done();
  },

  '9. Listeners on `*`. (using an array)': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var f = function () {
      test.ok(true, 'the event was fired')
    };
    
    emitter.on(['*'], f);
    emitter.emit('*')
    
    test.expect(1);
    test.done();
  },

  '10. actual event name': function(test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    emitter.on('foo', function() {
      emitter.emit('bar'); // changes the current event, passes the old one in as a parameter.
    });
    
    emitter.on('*', function() {
       console.log(this.event);
    });

    emitter.emit('foo');
    
    test.done();
  },
  
  '11. Listeners with multi-level wildcards': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    var i = 0;
    var f = function (n) {
      return function() {
        //console.log('Event', n, 'fired by', this.event);
        test.ok(true, 'the event was fired');
      };
    };

    emitter.on('**.test', f(i++));     // 0: 0 + 1 + 0 + 0 + 1 + 1 + 1 + 1 + 1 + 1
    emitter.on('**.bar.**', f(i++));   // 1: 0 + 1 + 1 + 1 + 1 + 0 + 0 + 1 + 1 + 1
    emitter.on('**.*', f(i++));        // 2: 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1
    emitter.on('*.**', f(i++));        // 3: 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1
    emitter.on('**', f(i++));          // 4: 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1
    emitter.on('other.**', f(i++));    // 5: 1 + 0 + 0 + 0 + 1 + 0 + 0 + 0 + 1 + 1
    emitter.on('foo.**.test', f(i++)); // 6: 0 + 1 + 0 + 0 + 1 + 0 + 1 + 1 + 1 + 1
    emitter.on('test.**', f(i++));     // 7: 0 + 0 + 0 + 0 + 1 + 1 + 0 + 0 + 1 + 1
    // Add forbidden patterns for safety purpose.
    emitter.on('**.**', f(i++));
    emitter.on('a.b.**.**', f(i++));
    emitter.on('**.**.a.b', f(i++));
    emitter.on('a.b.**.**.a.b', f(i++));

    emitter.emit('other.emit');   // 4  
    emitter.emit('foo.bar.test'); // 6
    emitter.emit('foo.bar.test.bar.foo.test.foo'); // 4
    emitter.emit('bar.bar.bar.bar.bar.bar'); // 4
    emitter.emit('**.*'); // 8
    emitter.emit('test'); // 5
    emitter.emit('foo.test'); // 5
    emitter.emit('foo.**.*'); // 6
    emitter.emit('**.test'); // 8
    emitter.emit('**.test.**'); // 8
    //emitter.emit('*.**.test.**.a'); // 0
    
    test.expect(58);
    test.done();
  },

  '12. Check return values of emit for wildcard emitter.': function (test) {

    var emitter = new EventEmitter2({ 
      wildcard: true
    });

    emitter.on('foo.*', function () {
      test.ok(true, 'The event was raised');
    });
    
    emitter.onAny(function () {
      test.ok(true, 'The event was raised');
    });

    test.ok(emitter.emit('foo.blah'), 'emit should return true after calling a listener');
    test.ok(emitter.emit('bar'), 'emit should return true after calling a listener');

    test.expect(5);
    test.done();
  }

});
