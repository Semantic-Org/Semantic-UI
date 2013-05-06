# EventEmitter2

EventEmitter2 is a an implementation of the EventEmitter found in Node.js

## Features

 - Namespaces/Wildcards.
 - Times To Listen (TTL), extends the `once` concept with `many`.
 - Browser environment compatibility.
 - Demonstrates good performance in benchmarks

```
EventEmitterHeatUp x 3,728,965 ops/sec \302\2610.68% (60 runs sampled)
EventEmitter x 2,822,904 ops/sec \302\2610.74% (63 runs sampled)
EventEmitter2 x 7,251,227 ops/sec \302\2610.55% (58 runs sampled)
EventEmitter2 (wild) x 3,220,268 ops/sec \302\2610.44% (65 runs sampled)
Fastest is EventEmitter2
```

## Differences (Non breaking, compatible with existing EventEmitter)

 - The constructor takes a configuration object.
 
```javascript
    var EventEmitter2 = require('eventemitter2').EventEmitter2;
    var server = new EventEmitter2({
      wildcard: true, // should the event emitter use wildcards.
      delimiter: '::', // the delimiter used to segment namespaces, defaults to `.`.
      newListener: false, // if you want to emit the newListener event set to true.
      maxListeners: 20, // the max number of listeners that can be assigned to an event, defaults to 10.
    });
```

 - Getting the actual event that fired.

```javascript
    server.on('foo.*', function(value1, value2) {
      console.log(this.event, value1, value2);
    });
```

 - Fire an event N times and then remove it, an extension of the `once` concept.

```javascript
    server.many('foo', 4, function() {
      console.log('hello');
    });
```

 - Pass in a namespaced event as an array rather than a delimited string.

```javascript
    server.many(['foo', 'bar', 'bazz'], function() {
      console.log('hello');
    });
```


## API

When an `EventEmitter` instance experiences an error, the typical action is
to emit an `error` event. Error events are treated as a special case.
If there is no listener for it, then the default action is to print a stack
trace and exit the program.

All EventEmitters emit the event `newListener` when new listeners are
added.


**Namespaces** with **Wildcards**
To use namespaces/wildcards, pass the `wildcard` option into the EventEmitter constructor.
When namespaces/wildcards are enabled, events can either be strings (`foo.bar`) separated
by a delimiter or arrays (`['foo', 'bar']`). The delimiter is also configurable as a 
constructor option.

An event name passed to any event emitter method can contain a wild card (the `*` character).
If the event name is a string, a wildcard may appear as `foo.*`. If the event name is an array, 
the wildcard may appear as `['foo', '*']`.

If either of the above described events were passed to the `on` method, subsequent emits such 
as the following would be observed...

```javascript
   emitter.emit('foo.bazz');
   emitter.emit(['foo', 'bar']);
```


#### emitter.addListener(event, listener)
#### emitter.on(event, listener)

Adds a listener to the end of the listeners array for the specified event.

```javascript
    server.on('data', function(value1, value2, value3 /* accepts any number of expected values... */) {
      console.log('The event was raised!');
    });
```

```javascript
    server.on('data', function(value) {
      console.log('The event was raised!');
    });
```

#### emitter.onAny(listener)

Adds a listener that will be fired when any event is emitted.

```javascript
    server.onAny(function(value) {
      console.log('All events trigger this.');
    });
```

#### emitter.offAny(listener)

Removes the listener that will be fired when any event is emitted.

```javascript
    server.offAny(function(value) {
      console.log('The event was raised!');
    });
```

#### emitter.once(event, listener)

Adds a **one time** listener for the event. The listener is invoked only the first time the event is fired, after which it is removed.

```javascript
    server.once('get', function (value) {
      console.log('Ah, we have our first value!');
    });
```

#### emitter.many(event, timesToListen, listener)

Adds a listener that will execute **n times** for the event before being removed. The listener is invoked only the first time the event is fired, after which it is removed.

```javascript
    server.many('get', 4, function (value) {
      console.log('This event will be listened to exactly four times.');
    });
```


#### emitter.removeListener(event, listener)
#### emitter.off(event, listener)

Remove a listener from the listener array for the specified event. **Caution**: changes array indices in the listener array behind the listener.

```javascript
    var callback = function(value) {
      console.log('someone connected!');
    };
    server.on('get', callback);
    // ...
    server.removeListener('get', callback);
```


#### emitter.removeAllListeners([event])

Removes all listeners, or those of the specified event.


#### emitter.setMaxListeners(n)

By default EventEmitters will print a warning if more than 10 listeners are added to it. This is a useful default which helps finding memory leaks. Obviously not all Emitters should be limited to 10. This function allows that to be increased. Set to zero for unlimited.


#### emitter.listeners(event)

Returns an array of listeners for the specified event. This array can be manipulated, e.g. to remove listeners.

```javascript
    server.on('get', function(value) {
      console.log('someone connected!');
    });
    console.log(console.log(server.listeners('get')); // [ [Function] ]
```

#### emitter.listenersAny()

Returns an array of listeners that are listening for any event that is specified. This array can be manipulated, e.g. to remove listeners.

```javascript
    server.onAny(function(value) {
      console.log('someone connected!');
    });
    console.log(console.log(server.listenersAny()[0]); // [ [Function] ] // someone connected!
```

#### emitter.emit(event, [arg1], [arg2], [...])

Execute each of the listeners that may be listening for the specified event name in order with the list of arguments.

## Test coverage

There is a test suite that tries to cover each use case, it can be found <a href="https://github.com/hij1nx/EventEmitter2/tree/master/test">here</a>.

## Licence

(The MIT License)

Copyright (c) 2011 hij1nx <http://www.twitter.com/hij1nx>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
