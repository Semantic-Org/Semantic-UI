/*
 * JavaScript Hooker
 * http://github.com/cowboy/javascript-hooker
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

(function(exports) {
  // Get an array from an array-like object with slice.call(arrayLikeObject).
  var slice = [].slice;
  // Get an "[object [[Class]]]" string with toString.call(value).
  var toString = {}.toString;

  // I can't think of a better way to ensure a value is a specific type other
  // than to create instances and use the `instanceof` operator.
  function HookerOverride(v) { this.value = v; }
  function HookerPreempt(v) { this.value = v; }
  function HookerFilter(c, a) { this.context = c; this.args = a; }

  // When a pre- or post-hook returns the result of this function, the value
  // passed will be used in place of the original function's return value. Any
  // post-hook override value will take precedence over a pre-hook override
  // value.
  exports.override = function(value) {
    return new HookerOverride(value);
  };

  // When a pre-hook returns the result of this function, the value passed will
  // be used in place of the original function's return value, and the original
  // function will NOT be executed.
  exports.preempt = function(value) {
    return new HookerPreempt(value);
  };

  // When a pre-hook returns the result of this function, the context and
  // arguments passed will be applied into the original function.
  exports.filter = function(context, args) {
    return new HookerFilter(context, args);
  };

  // Execute callback(s) for properties of the specified object.
  function forMethods(obj, props, callback) {
    var prop;
    if (typeof props === "string") {
      // A single prop string was passed. Create an array.
      props = [props];
    } else if (props == null) {
      // No props were passed, so iterate over all properties, building an
      // array. Unfortunately, Object.keys(obj) doesn't work everywhere yet, so
      // this has to be done manually.
      props = [];
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          props.push(prop);
        }
      }
    }
    // Execute callback for every method in the props array.
    var i = props.length;
    while (i--) {
      // If the property isn't a function...
      if (toString.call(obj[props[i]]) !== "[object Function]" ||
        // ...or the callback returns false...
        callback(obj, props[i]) === false) {
        // ...remove it from the props array to be returned.
        props.splice(i, 1);
      }
    }
    // Return an array of method names for which the callback didn't fail.
    return props;
  }

  // Monkey-patch (hook) a method of an object.
  exports.hook = function(obj, props, options) {
    // If the props argument was omitted, shuffle the arguments.
    if (options == null) {
      options = props;
      props = null;
    }
    // If just a function is passed instead of an options hash, use that as a
    // pre-hook function.
    if (typeof options === "function") {
      options = {pre: options};
    }

    // Hook the specified method of the object.
    return forMethods(obj, props, function(obj, prop) {
      // The original (current) method.
      var orig = obj[prop];
      // The new hooked function.
      function hooked() {
        var result, origResult, tmp;

        // Get an array of arguments.
        var args = slice.call(arguments);

        // If passName option is specified, prepend prop to the args array,
        // passing it as the first argument to any specified hook functions.
        if (options.passName) {
          args.unshift(prop);
        }

        // If a pre-hook function was specified, invoke it in the current
        // context with the passed-in arguments, and store its result.
        if (options.pre) {
          result = options.pre.apply(this, args);
        }

        if (result instanceof HookerFilter) {
          // If the pre-hook returned hooker.filter(context, args), invoke the
          // original function with that context and arguments, and store its
          // result.
          origResult = result = orig.apply(result.context, result.args);
        } else if (result instanceof HookerPreempt) {
          // If the pre-hook returned hooker.preempt(value) just use the passed
          // value and don't execute the original function.
          origResult = result = result.value;
        } else {
          // Invoke the original function in the current context with the
          // passed-in arguments, and store its result.
          origResult = orig.apply(this, arguments);
          // If the pre-hook returned hooker.override(value), use the passed
          // value, otherwise use the original function's result.
          result = result instanceof HookerOverride ? result.value : origResult;
        }

        if (options.post) {
          // If a post-hook function was specified, invoke it in the current
          // context, passing in the result of the original function as the
          // first argument, followed by any passed-in arguments.
          tmp = options.post.apply(this, [origResult].concat(args));
          if (tmp instanceof HookerOverride) {
            // If the post-hook returned hooker.override(value), use the passed
            // value, otherwise use the previously computed result.
            result = tmp.value;
          }
        }

        // Unhook if the "once" option was specified.
        if (options.once) {
          exports.unhook(obj, prop);
        }

        // Return the result!
        return result;
      }
      // Re-define the method.
      obj[prop] = hooked;
      // Fail if the function couldn't be hooked.
      if (obj[prop] !== hooked) { return false; }
      // Store a reference to the original method as a property on the new one.
      obj[prop]._orig = orig;
    });
  };

  // Get a reference to the original method from a hooked function.
  exports.orig = function(obj, prop) {
    return obj[prop]._orig;
  };

  // Un-monkey-patch (unhook) a method of an object.
  exports.unhook = function(obj, props) {
    return forMethods(obj, props, function(obj, prop) {
      // Get a reference to the original method, if it exists.
      var orig = exports.orig(obj, prop);
      // If there's no original method, it can't be unhooked, so fail.
      if (!orig) { return false; }
      // Unhook the method.
      obj[prop] = orig;
    });
  };
}(typeof exports === "object" && exports || this));
