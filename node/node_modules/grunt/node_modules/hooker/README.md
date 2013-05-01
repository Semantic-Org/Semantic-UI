# JavaScript Hooker

Monkey-patch (hook) functions for debugging and stuff.

## Getting Started

This code should work just fine in Node.js:

First, install the module with: `npm install hooker`

```javascript
var hooker = require('hooker');
hooker.hook(Math, "max", function() {
  console.log(arguments.length + " arguments passed");
});
Math.max(5, 6, 7) // logs: "3 arguments passed", returns 7
```

Or in the browser:

```html
<script src="dist/ba-hooker.min.js"></script>
<script>
hook(Math, "max", function() {
  console.log(arguments.length + " arguments passed");
});
Math.max(5, 6, 7) // logs: "3 arguments passed", returns 7
</script>
```

In the browser, you can attach Hooker's methods to any object.

```html
<script>
this.exports = Bocoup.utils;
</script>
<script src="dist/ba-hooker.min.js"></script>
<script>
Bocoup.utils.hook(Math, "max", function() {
  console.log(arguments.length + " arguments passed");
});
Math.max(5, 6, 7) // logs: "3 arguments passed", returns 7
</script>
```

## Documentation

### hooker.hook
Monkey-patch (hook) one or more methods of an object.
#### Signature:
`hooker.hook(object, [ props, ] [options | prehookFunction])`
#### `props`
The optional `props` argument can be a method name, array of method names or null. If null (or omitted), all enumerable methods of `object` will be hooked.
#### `options`
* `pre` - (Function) a pre-hook function to be executed before the original function. Arguments passed into the method will be passed into the pre-hook function as well.
* `post` - (Function) a post-hook function to be executed after the original function. The original function's result is passed into the post-hook function as its first argument, followed by the method arguments.
* `once` - (Boolean) if true, auto-unhook the function after the first execution.
* `passName` - (Boolean) if true, pass the name of the method into the pre-hook function as its first arg (preceding all other arguments), and into the post-hook function as the second arg (after result but preceding all other arguments).

#### Returns:
An array of hooked method names.

### hooker.unhook
Un-monkey-patch (unhook) one or more methods of an object.
#### Signature:
`hooker.unhook(object [, props ])`
#### `props`
The optional `props` argument can be a method name, array of method names or null. If null (or omitted), all methods of `object` will be unhooked.
#### Returns:
An array of unhooked method names.

### hooker.orig
Get a reference to the original method from a hooked function.
#### Signature:
`hooker.orig(object, props)`

### hooker.override
When a pre- or post-hook returns the result of this function, the value
passed will be used in place of the original function's return value. Any
post-hook override value will take precedence over a pre-hook override value.
#### Signature:
`hooker.override(value)`

### hooker.preempt
When a pre-hook returns the result of this function, the value passed will
be used in place of the original function's return value, and the original
function will NOT be executed.
#### Signature:
`hooker.preempt(value)`

### hooker.filter
When a pre-hook returns the result of this function, the context and
arguments passed will be applied into the original function.
#### Signature:
`hooker.filter(context, arguments)`


## Examples
See the unit tests for more examples.

```javascript
var hooker = require('hooker');
// Simple logging.
hooker.hook(Math, "max", function() {
  console.log(arguments.length + " arguments passed");
});
Math.max(5, 6, 7) // logs: "3 arguments passed", returns 7

hooker.unhook(Math, "max"); // (This is assumed between all further examples)
Math.max(5, 6, 7) // 7

// Returning hooker.override(value) overrides the original value.
hooker.hook(Math, "max", function() {
  if (arguments.length === 0) {
    return hooker.override(9000);
  }
});
Math.max(5, 6, 7) // 7
Math.max() // 9000

// Auto-unhook after one execution.
hooker.hook(Math, "max", {
  once: true,
  pre: function() {
    console.log("Init something here");
  }
});
Math.max(5, 6, 7) // logs: "Init something here", returns 7
Math.max(5, 6, 7) // 7

// Filter `this` and arguments through a pre-hook function.
hooker.hook(Math, "max", {
  pre: function() {
    var args = [].map.call(arguments, function(num) {
      return num * 2;
    });
    return hooker.filter(this, args); // thisValue, arguments
  }
});
Math.max(5, 6, 7) // 14

// Modify the original function's result with a post-hook function.
hooker.hook(Math, "max", {
  post: function(result) {
    return hooker.override(result * 100);
  }
});
Math.max(5, 6, 7) // 700

// Hook every Math method. Note: if Math's methods were enumerable, the second
// argument could be omitted. Since they aren't, an array of properties to hook
// must be explicitly passed. Non-method properties will be skipped.
// See a more generic example here: http://bit.ly/vvJlrS
hooker.hook(Math, Object.getOwnPropertyNames(Math), {
  passName: true,
  pre: function(name) {
    console.log("=> Math." + name, [].slice.call(arguments, 1));
  },
  post: function(result, name) {
    console.log("<= Math." + name, result);
  }
});

var result = Math.max(5, 6, 7);
// => Math.max [ 5, 6, 7 ]
// <= Math.max 7
result // 7

result = Math.ceil(3.456);
// => Math.ceil [ 3.456 ]
// <= Math.ceil 4
result // 4
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History
2012/01/09 - v0.2.3 - First official release.

## License
Copyright (c) 2012 "Cowboy" Ben Alman  
Licensed under the MIT license.  
<http://benalman.com/about/license/>
