/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

var grunt = require('../grunt');

// The module to be exported.
var template = module.exports = {};

// External libs.
template.date = require('dateformat');

// Format today's date.
template.today = function(format) {
  return template.date(new Date(), format);
};

// Set underscore template delimiters.
template.delimiters = function(mode) {
  var modes = {
    // The underscore default template syntax should be a pretty sane default.
    default: {
      // Used by grunt.
      opener:       '<%',
      // Used by underscore.
      evaluate:     /<%([\s\S]+?)%>/g,
      interpolate:  /<%=([\s\S]+?)%>/g,
      escape:       /<%-([\s\S]+?)%>/g
    },
    // The "init" task needs separate delimiters to avoid conflicts, so the <>
    // are replaced with {}. Otherwise, they behave the same.
    init: {
      // Used by grunt.
      opener:       '{%',
      // Used by underscore.
      evaluate:     /\{%([\s\S]+?)%\}/g,
      interpolate:  /\{%=([\s\S]+?)%\}/g,
      escape:       /\{%-([\s\S]+?)%\}/g
    }
  };
  var settings = modes[mode in modes ? mode : 'default'];
  grunt.utils._.templateSettings = settings;
  // Get opener character for grunt to use.
  var opener = settings.opener;
  // Remove it from the underscore object and return it.
  delete settings.opener;
  return opener;
};

// Process template + data with underscore.
template.process = function(template, data, mode) {
  // Set delimiters, and get a opening match character.
  var opener = grunt.template.delimiters(mode);
  // Clone data, initializing to config data or empty object if omitted.
  data = Object.create(data || grunt.config() || {});
  // Expose grunt so that grunt utilities can be accessed, but only if it
  // doesn't conflict with an existing .grunt property.
  if (!('grunt' in data)) { data.grunt = grunt; }
  // Keep track of last change.
  var last = template;
  try {
    // As long as template contains template tags, render it and get the result,
    // otherwise just use the template string.
    while (template.indexOf(opener) >= 0) {
      template = grunt.utils._.template(template)(data);
      // Abort if template didn't change - nothing left to process!
      if (template === last) { break; }
      last = template;
    }
  } catch (e) {
    grunt.warn('An error occurred while processing a template (' + e.message + ').');
  }
  // Normalize linefeeds and return.
  return grunt.utils.normalizelf(template);
};
