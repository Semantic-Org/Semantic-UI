/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

var grunt = require('../grunt');

// The module to be exported.
var template = module.exports = {};

// External libs.
template.date = require('dateformat');

// Format today's date.
template.today = function(format) {
  return template.date(new Date(), format);
};

// Template delimiters.
var allDelimiters = {};

// Initialize template delimiters.
template.addDelimiters = function(name, opener, closer) {
  var delimiters = allDelimiters[name] = {};
  // Used by grunt.
  delimiters.opener = opener;
  delimiters.closer = closer;
  // Generate RegExp patterns dynamically.
  var a = delimiters.opener.replace(/(.)/g, '\\$1');
  var b = '([\\s\\S]+?)' + delimiters.closer.replace(/(.)/g, '\\$1');
  // Used by Lo-Dash.
  delimiters.lodash = {
    evaluate: new RegExp(a + b, 'g'),
    interpolate: new RegExp(a + '=' + b, 'g'),
    escape: new RegExp(a + '-' + b, 'g')
  };
};

// The underscore default template syntax should be a pretty sane default for
// the config system.
template.addDelimiters('config', '<%', '%>');

// Set Lo-Dash template delimiters.
template.setDelimiters = function(name) {
  // Get the appropriate delimiters.
  var delimiters = allDelimiters[name in allDelimiters ? name : 'config'];
  // Tell Lo-Dash which delimiters to use.
  grunt.util._.templateSettings = delimiters.lodash;
  // Return the delimiters.
  return delimiters;
};

// Process template + data with Lo-Dash.
template.process = function(tmpl, options) {
  if (!options) { options = {}; }
  // Set delimiters, and get a opening match character.
  var delimiters = template.setDelimiters(options.delimiters);
  // Clone data, initializing to config data or empty object if omitted.
  var data = Object.create(options.data || grunt.config.data || {});
  // Expose grunt so that grunt utilities can be accessed, but only if it
  // doesn't conflict with an existing .grunt property.
  if (!('grunt' in data)) { data.grunt = grunt; }
  // Keep track of last change.
  var last = tmpl;
  try {
    // As long as tmpl contains template tags, render it and get the result,
    // otherwise just use the template string.
    while (tmpl.indexOf(delimiters.opener) >= 0) {
      tmpl = grunt.util._.template(tmpl, data);
      // Abort if template didn't change - nothing left to process!
      if (tmpl === last) { break; }
      last = tmpl;
    }
  } catch (e) {
    // In upgrading to Lo-Dash (or Underscore.js 1.3.3), \n and \r in template
    // tags now causes an exception to be thrown. Warn the user why this is
    // happening. https://github.com/documentcloud/underscore/issues/553
    if (String(e) === 'SyntaxError: Unexpected token ILLEGAL' && /\n|\r/.test(tmpl)) {
      grunt.log.errorlns('A special character was detected in this template. ' +
        'Inside template tags, the \\n and \\r special characters must be ' +
        'escaped as \\\\n and \\\\r. (grunt 0.4.0+)');
    }
    // Slightly better error message.
    e.message = 'An error occurred while processing a template (' + e.message + ').';
    grunt.warn(e, grunt.fail.code.TEMPLATE_ERROR);
  }
  // Normalize linefeeds and return.
  return grunt.util.normalizelf(tmpl);
};
