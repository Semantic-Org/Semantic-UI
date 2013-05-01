/*
 * common.js: Internal helper and utility functions for winston
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var util = require('util'),
    crypto = require('crypto'),
    config = require('./config');

//
// ### function setLevels (target, past, current)
// #### @target {Object} Object on which to set levels.
// #### @past {Object} Previous levels set on target.
// #### @current {Object} Current levels to set on target.
// Create functions on the target objects for each level 
// in current.levels. If past is defined, remove functions
// for each of those levels.
//
exports.setLevels = function (target, past, current, isDefault) {
  if (past) {
    Object.keys(past).forEach(function (level) {
      delete target[level];
    });
  }

  target.levels = current || config.npm.levels;
  if (target.padLevels) {
    target.levelLength = exports.longestElement(Object.keys(target.levels));
  }
  
  //
  //  Define prototype methods for each log level
  //  e.g. target.log('info', msg) <=> target.info(msg)
  //
  Object.keys(target.levels).forEach(function (level) {
    target[level] = function (msg) {
      var args     = Array.prototype.slice.call(arguments),
          callback = typeof args[args.length - 1] === 'function' || !args[args.length - 1] ? args.pop() : null,
          meta     = args.length === 2 ? args.pop() : null;

      return target.log(level, msg, meta, callback);
    };
  });
  
  return target;
};

//
// ### function longestElement
// #### @xs {Array} Array to calculate against
// Returns the longest element in the `xs` array.
//
exports.longestElement = function (xs) {
  return Math.max.apply(
    null,
    xs.map(function (x) { return x.length; })
  );
};

//
// ### function clone (obj)
// #### @obj {Object} Object to clone.
// Helper method for deep cloning pure JSON objects
// i.e. JSON objects that are either literals or objects (no Arrays, etc)
//
exports.clone = function (obj) {
  // we only need to clone refrence types (Object)
  if (!(obj instanceof Object)) {
    return obj;
  }
  else if (obj instanceof Date) {
    return obj;
  }

  var copy = {};
  for (var i in obj) {
    if (Array.isArray(obj[i])) {
      copy[i] = obj[i].slice(0);
    }
    else if (obj[i] instanceof Buffer) {
        copy[i] = obj[i].slice(0);
    }
    else if (typeof obj[i] != 'function') {
      copy[i] = obj[i] instanceof Object ? exports.clone(obj[i]) : obj[i];
    }
  }

  return copy;
};

//
// ### function log (options)
// #### @options {Object} All information about the log serialization.
// Generic logging function for returning timestamped strings 
// with the following options:
// 
//    {
//      level:     'level to add to serialized message',
//      message:   'message to serialize',
//      meta:      'additional logging metadata to serialize',
//      colorize:  false, // Colorizes output (only if `.json` is false)
//      timestamp: true   // Adds a timestamp to the serialized message
//    }
//
exports.log = function (options) {
  var timestampFn = typeof options.timestamp === 'function' ? options.timestamp : exports.timestamp,
      timestamp   = options.timestamp ? timestampFn() : null,
      meta        = options.meta ? exports.clone(options.meta) : null,
      output;

  //
  // raw mode is intended for outputing winston as streaming JSON to STDOUT
  //
  if (options.raw) {
    output         = meta || {};
    output.level   = options.level;
    output.message = options.message.stripColors;
    return JSON.stringify(output);
  }

  //
  // json mode is intended for pretty printing multi-line json to the terminal
  //
  if (options.json) {
    output         = meta || {};
    output.level   = options.level;
    output.message = options.message;
    
    if (timestamp) {
      output.timestamp = timestamp;
    }

    return typeof options.stringify === 'function' 
      ? options.stringify(output)
      : JSON.stringify(output, function(key, value) {
    	  if (value instanceof Buffer) {
	        return value.toString('base64');
	    }
	    return value;
      });
  }

  output = timestamp ? timestamp + ' - ' : '';
  output += options.colorize ? config.colorize(options.level) : options.level;
  output += (': ' + options.message);

  if (meta) {
    if (typeof meta !== 'object') {
      output += ' ' + meta;
    }
    else if (Object.keys(meta).length > 0) {
      output += ' ' + exports.serialize(meta);
    }
  } 

  return output;
};

exports.capitalize = function (str) {
  return str && str[0].toUpperCase() + str.slice(1);
};

//
// ### function hash (str)
// #### @str {string} String to hash.
// Utility function for creating unique ids
// e.g. Profiling incoming HTTP requests on the same tick
//
exports.hash = function (str) {
  return crypto.createHash('sha1').update(str).digest('hex');
};

//
// ## Borrowed from node.js core
// I wanted a universal lowercase header message, as opposed to the `DEBUG`
// (i.e. all uppercase header) used only in `util.debug()`
//
var months = ['Jan', 'Feb', 'Mar', 'Apr', 
              'May', 'Jun', 'Jul', 'Aug', 
              'Sep', 'Oct', 'Nov', 'Dec'];

//
// ### function pad (n)
// Returns a padded string if `n < 10`.
//
exports.pad = function (n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
};

//
// ### function timestamp ()
// Returns a timestamp string for the current time.
//
exports.timestamp = function () {
  var d = new Date();
  var time = [
    exports.pad(d.getHours()),
    exports.pad(d.getMinutes()),
    exports.pad(d.getSeconds())
  ].join(':');
              
  return [d.getDate(), months[d.getMonth()], time].join(' ');
};

//
// ### function serialize (obj, key)
// #### @obj {Object|literal} Object to serialize
// #### @key {string} **Optional** Optional key represented by obj in a larger object
// Performs simple comma-separated, `key=value` serialization for Loggly when 
// logging to non-JSON inputs.
//
exports.serialize = function (obj, key) {
  if (obj === null) {
    obj = 'null';
  }
  else if (obj === undefined) {
    obj = 'undefined';
  }
  else if (obj === false) {
    obj = 'false';
  }
  
  if (typeof obj !== 'object') {
    return key ? key + '=' + obj : obj;
  }

  if (obj instanceof Buffer) {
    return key ? key + '=' + obj.toString('base64') : obj.toString('base64');
  }

  var msg = '',
      keys = Object.keys(obj),
      length = keys.length;
  
  for (var i = 0; i < length; i++) {
    if (Array.isArray(obj[keys[i]])) {
      msg += keys[i] + '=[';
      
      for (var j = 0, l = obj[keys[i]].length; j < l; j++) {
        msg += exports.serialize(obj[keys[i]][j]);
        if (j < l - 1) {
          msg += ', ';
        }
      }
      
      msg += ']';
    }
    else if (obj[keys[i]] instanceof Date) {
      msg += keys[i] + '=' + obj[keys[i]];
    }
    else {
      msg += exports.serialize(obj[keys[i]], keys[i]);
    }    
    
    if (i < length - 1) {
      msg += ', ';
    }
  }
  
  return msg;
};
