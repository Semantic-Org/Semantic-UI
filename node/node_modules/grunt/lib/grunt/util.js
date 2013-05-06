/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

// Nodejs libs.
var spawn = require('child_process').spawn;
var nodeUtil = require('util');
var path = require('path');

// The module to be exported.
var util = module.exports = {};

// A few internal utilites, exposed.
util.task = require('../util/task');
util.namespace = require('../util/namespace');
// Use instead of process.exit to ensure stdout/stderr are flushed
// before exiting in Windows (Tested in Node.js v0.8.7)
util.exit = require('../util/exit').exit;

// External libs.
util.hooker = require('hooker');
util.async = require('async');
var _ = util._ = require('lodash');
var which = require('which').sync;

// Mixin Underscore.string methods.
_.str = require('underscore.string');
_.mixin(_.str.exports());

// Return a function that normalizes the given function either returning a
// value or accepting a "done" callback that accepts a single value.
util.callbackify = function(fn) {
  return function callbackable() {
    // Invoke original function, getting its result.
    var result = fn.apply(this, arguments);
    // If the same number or less arguments were specified than fn accepts,
    // assume the "done" callback was already handled.
    var length = arguments.length;
    if (length === fn.length) { return; }
    // Otherwise, if the last argument is a function, assume it is a "done"
    // callback and call it.
    var done = arguments[length - 1];
    if (typeof done === 'function') { done(result); }
  };
};

// Create a new Error object, with an origError property that will be dumped
// if grunt was run with the --debug=9 option.
util.error = function(err, origError) {
  if (!nodeUtil.isError(err)) { err = new Error(err); }
  if (origError) { err.origError = origError; }
  return err;
};

// The line feed char for the current system.
util.linefeed = process.platform === 'win32' ? '\r\n' : '\n';

// Normalize linefeeds in a string.
util.normalizelf = function(str) {
  return str.replace(/\r\n|\n/g, util.linefeed);
};

// What "kind" is a value?
// I really need to rework https://github.com/cowboy/javascript-getclass
var kindsOf = {};
'Number String Boolean Function RegExp Array Date Error'.split(' ').forEach(function(k) {
  kindsOf['[object ' + k + ']'] = k.toLowerCase();
});
util.kindOf = function(value) {
  // Null or undefined.
  if (value == null) { return String(value); }
  // Everything else.
  return kindsOf[kindsOf.toString.call(value)] || 'object';
};

// Coerce something to an Array.
util.toArray = Function.call.bind(Array.prototype.slice);

// Return the string `str` repeated `n` times.
util.repeat = function(n, str) {
  return new Array(n + 1).join(str || ' ');
};

// Given str of "a/b", If n is 1, return "a" otherwise "b".
util.pluralize = function(n, str, separator) {
  var parts = str.split(separator || '/');
  return n === 1 ? (parts[0] || '') : (parts[1] || '');
};

// Recurse through objects and arrays, executing fn for each non-object.
util.recurse = function recurse(value, fn, fnContinue) {
  var obj;
  if (fnContinue && fnContinue(value) === false) {
    // Skip value if necessary.
    return value;
  } else if (util.kindOf(value) === 'array') {
    // If value is an array, recurse.
    return value.map(function(value) {
      return recurse(value, fn, fnContinue);
    });
  } else if (util.kindOf(value) === 'object') {
    // If value is an object, recurse.
    obj = {};
    Object.keys(value).forEach(function(key) {
      obj[key] = recurse(value[key], fn, fnContinue);
    });
    return obj;
  } else {
    // Otherwise pass value into fn and return.
    return fn(value);
  }
};

// Spawn a child process, capturing its stdout and stderr.
util.spawn = function(opts, done) {
  // Build a result object and pass it (among other things) into the
  // done function.
  var callDone = function(code, stdout, stderr) {
    // Remove trailing whitespace (newline)
    stdout = _.rtrim(stdout);
    stderr = _.rtrim(stderr);
    // Create the result object.
    var result = {
      stdout: stdout,
      stderr: stderr,
      code: code,
      toString: function() {
        if (code === 0) {
          return stdout;
        } else if ('fallback' in opts) {
          return opts.fallback;
        } else if (opts.grunt) {
          // grunt.log.error uses standard out, to be fixed in 0.5.
          return stderr || stdout;
        }
        return stderr;
      }
    };
    // On error (and no fallback) pass an error object, otherwise pass null.
    done(code === 0 || 'fallback' in opts ? null : new Error(stderr), result, code);
  };

  var cmd, args;
  var pathSeparatorRe = /[\\\/]/g;
  if (opts.grunt) {
    cmd = process.argv[0];
    args = [process.argv[1]].concat(opts.args);
  } else {
    // On Windows, child_process.spawn will only file .exe files in the PATH,
    // not other executable types (grunt issue #155).
    try {
      if (!pathSeparatorRe.test(opts.cmd)) {
        // Only use which if cmd has no path component.
        cmd = which(opts.cmd);
      } else {
        cmd = opts.cmd.replace(pathSeparatorRe, path.sep);
      }
    } catch (err) {
      callDone(127, '', String(err));
      return;
    }
    args = opts.args;
  }

  var child = spawn(cmd, args, opts.opts);
  var stdout = new Buffer('');
  var stderr = new Buffer('');
  if (child.stdout) {
    child.stdout.on('data', function(buf) {
      stdout = Buffer.concat([stdout, new Buffer(buf)]);
    });
  }
  if (child.stderr) {
    child.stderr.on('data', function(buf) {
      stderr = Buffer.concat([stderr, new Buffer(buf)]);
    });
  }
  child.on('close', function(code) {
    callDone(code, stdout.toString(), stderr.toString());
  });
  return child;
};
