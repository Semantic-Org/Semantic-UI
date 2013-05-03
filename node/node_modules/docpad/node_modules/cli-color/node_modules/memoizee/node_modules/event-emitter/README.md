# EventEmitter – Cross-environment event emitter solution for JavaScript

## Installation
### NPM

In your project path:

	$ npm install event-emitter

### Browser

Browser bundle can be easily created with help of [modules-webmake](https://github.com/medikoo/modules-webmake).  Mind that it relies on some EcmaScript5 features, so for older browsers you need as well [es5-shim](https://github.com/kriskowal/es5-shim).

## Usage

```javascript
var ee = require('event-emitter');

var emitter = ee({}), listener;

emitter.on('test', listener = function (args) {
  // …emitter logic
});

emitter.once('test', function (args) {
  // …invoked only once(!)
});

emitter.emit('test', arg1, arg2/*…args*/); // Two above listeners invoked
emitter.emit('test', arg1, arg2/*…args*/); // Only first listener invoked

emitter.off('test', listener);              // Removed first listener
emitter.emit('test', arg1, arg2/*…args*/); // No listeners invoked
```

## Additional functionalities (provided as separate modules)

### allOff(obj)

Remove all listeners

```javascript
var eeAllOff = require('event-emitter/lib/all-off');
eeAllOff(emitter); // Removed all registered listeners on emitter
```

### pipe(emitter1, emitter2)

Pipe events from one emitter to other

```javascript
var eePipe = require('event-emitter/lib/pipe');

var emitter1 = ee(), listener1;
var emitter2 = ee(), listener2;

emitter1.on('test', listener1 = function () { });
emitter2.on('test', listener2 = function () { });

emitter1.emit('test'); // Invoked listener1
emitter2.emit('test'); // Invoked listener2

var pipe = eePipe(emitter1, emitter2);

emitter1.emit('test'); // Invoked listener1 and listener2
emitter2.emit('test'); // Invoked just listener2

pipe.close();

emitter1.emit('test'); // Invoked listener1
emitter2.emit('test'); // Invoked listener2
```

### hasListeners(obj[, type])

Whether given object have registered listeners

```javascript
var emitter = ee();
var hasListeners = require('event-emitter/lib/has-listeners');
var listner = function () {};

hasListeners(emitter); // false

emitter.on('foo', listener);
hasListeners(emitter); // true
hasListeners(emitter, 'foo'); // true
hasListeners(emitter, 'bar'); // false

emitter.off('foo', listener);
hasListeners(emitter, 'foo'); // false
```

## Tests [![Build Status](https://secure.travis-ci.org/medikoo/event-emitter.png?branch=master)](https://secure.travis-ci.org/medikoo/event-emitter)

	$ npm test
