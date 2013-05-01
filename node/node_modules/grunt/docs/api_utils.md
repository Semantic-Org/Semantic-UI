[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# [The grunt API](api.md) / grunt.utils

Miscellaneous utilities, including Underscore.js, Async and Hooker.

See the [utils lib source](../lib/grunt/utils.js) for more information.

## The utils API

### grunt.utils.kindOf
Return the "kind" of a value. Like `typeof` but returns the internal `[[Class]]` value. Possible results are `"number"`, `"string"`, `"boolean"`, `"function"`, `"regexp"`, `"array"`, `"date"`, `"error"`, `"null"`, `"undefined"` and the catch-all `"object"`.

```javascript
grunt.utils.kindOf(value)
```

### grunt.utils.linefeed
The linefeed character, normalized for the current operating system. (`\r\n` on Windows, `\n` otherwise)

### grunt.utils.normalizelf
Given a string, return a new string with all the linefeeds normalized for the current operating system. (`\r\n` on Windows, `\n` otherwise)

```javascript
grunt.utils.normalizelf(string)
```

### grunt.utils.recurse
Recurse through nested objects and arrays, executing `callbackFunction` for each non-object value. If `continueFunction` returns `false`, a given object or value will be skipped.

```javascript
grunt.utils.recurse(object, callbackFunction, continueFunction)
```

See the [config lib source](../lib/grunt/config.js) for usage examples.

### grunt.utils.repeat
Return string `str` repeated `n` times.

```javascript
grunt.utils.repeat(n, str)
```

### grunt.utils.pluralize
Given `str` of `"a/b"`, If `n` is `1`, return `"a"` otherwise `"b"`. You can specify a custom separator if '/' doesn't work for you.

```javascript
grunt.utils.pluralize(n, str, separator)
```

### grunt.utils.spawn
Spawn a child process, keeping track of its stdout, stderr and exit code. The method returns a reference to the spawned child. When the child exits, the done function is called.

```javascript
grunt.utils.spawn(options, doneFunction)
```

The `options` object has these possible properties:

```javascript
var options = {
  // The command to execute. It should be in the system path.
  cmd: commandToExecute,
  // An array of arguments to pass to the command.
  args: arrayOfArguments,
  // Additional options for the Node.js child_process spawn method.
  opts: nodeSpawnOptions,
  // If this value is set and an error occurs, it will be used as the value
  // and null will be passed as the error value.
  fallback: fallbackValue
};
```

The done function accepts these arguments:

```javascript
function doneFunction(error, result, code) {
  // If the exit code was non-zero and a fallback wasn't specified, the error
  // object is the same as the result object.
  error
  // The result object is an object with the properties .stdout, .stderr, and
  // .code (exit code).
  result
  // When result is coerced to a string, the value is stdout if the exit code
  // was zero, the fallback if the exit code was non-zero and a fallback was
  // specified, or stderr if the exit code was non-zero and a fallback was
  // not specified.
  String(result)
  // The numeric exit code.
  code
}
```

See the [init task source](../tasks/init.js) and the [qunit task source](../tasks/qunit.js) for usage examples.


### grunt.utils.toArray
Given an array or array-like object, return an array. Great for converting `arguments` objects into arrays.

```javascript
grunt.utils.toArray(arrayLikeObject)
```

## Internal libraries

### grunt.utils.namespace
An internal library for resolving deeply-nested properties in objects.

### grunt.utils.task
An internal library for task running.


## External libraries

### grunt.utils._
[Underscore.js](http://underscorejs.org/) - Tons of super-useful array, function and object utility methods.
[Underscore.string](https://github.com/epeli/underscore.string) - Tons of string utility methods.

Note that Underscore.string is mixed into `grunt.utils._` but is also available as `grunt.utils._.str` for methods that conflict with existing Underscore.js methods.

### grunt.utils.async
[Async](https://github.com/caolan/async) - Async utilities for node and the browser.

### grunt.utils.hooker
[JavaScript Hooker](https://github.com/cowboy/javascript-hooker) - Monkey-patch (hook) functions for debugging and stuff.

