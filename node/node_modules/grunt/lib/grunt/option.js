/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

// The actual option data.
var data = {};

// Get or set an option value.
var option = module.exports = function(key, value) {
  var no = key.match(/^no-(.+)$/);
  if (arguments.length === 2) {
    return (data[key] = value);
  } else if (no) {
    return data[no[1]] === false;
  } else {
    return data[key];
  }
};

// Initialize option data.
option.init = function(obj) {
  return (data = obj || {});
};

// List of options as flags.
option.flags = function() {
  return Object.keys(data).filter(function(key) {
    // Don't display empty arrays.
    return !(Array.isArray(data[key]) && data[key].length === 0);
  }).map(function(key) {
    var val = data[key];
    return '--' + (val === false ? 'no-' : '') + key +
      (typeof val === 'boolean' ? '' : '=' + val);
  });
};
