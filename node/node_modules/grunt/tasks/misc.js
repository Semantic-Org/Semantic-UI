/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

module.exports = function(grunt) {

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  // Get a config property. Most useful as a directive like <config:foo.bar>.
  grunt.registerHelper('config', grunt.config);

  // Read a JSON file. Most useful as a directive like <json:package.json>.
  var jsons = {};
  grunt.registerHelper('json', function(filepath) {
    // Don't re-fetch if being called as a directive and JSON is already cached.
    if (!this.directive || !(filepath in jsons)) {
      jsons[filepath] = grunt.file.readJSON(filepath);
    }
    return jsons[filepath];
  });

  // Return the given source coude with any leading banner comment stripped.
  grunt.registerHelper('strip_banner', function(src, options) {
    if (!options) { options = {}; }
    var m = [];
    if (options.line) {
      // Strip // ... leading banners.
      m.push('(?:.*\\/\\/.*\\n)*\\s*');
    }
    if (options.block) {
      // Strips all /* ... */ block comment banners.
      m.push('\\/\\*[\\s\\S]*?\\*\\/');
    } else {
      // Strips only /* ... */ block comment banners, excluding /*! ... */.
      m.push('\\/\\*[^!][\\s\\S]*?\\*\\/');
    }
    var re = new RegExp('^\\s*(?:' + m.join('|') + ')\\s*', '');
    return src.replace(re, '');
  });

  // Get a source file's contents with any leading banner comment stripped. If
  // used as a directive, get options from the flags object.
  grunt.registerHelper('file_strip_banner', function(filepath, opts) {
    var src = grunt.file.read(filepath);
    return grunt.helper('strip_banner', src, this.directive ? this.flags : opts);
  });

  // Process a file as a template.
  grunt.registerHelper('file_template', function(filepath) {
    var src = grunt.file.read(filepath);
    return grunt.template.process(src);
  });

  // Generate banner from template.
  grunt.registerHelper('banner', function(prop) {
    if (!prop) { prop = 'meta.banner'; }
    var banner;
    var tmpl = grunt.config(prop);
    if (tmpl) {
      // Now, log.
      grunt.verbose.write('Generating banner...');
      try {
        // Compile and run template, using config object as the data source.
        banner = grunt.template.process(tmpl) + grunt.utils.linefeed;
        grunt.verbose.ok();
      } catch(e) {
        banner = '';
        grunt.verbose.error();
        grunt.warn(e, 11);
      }
    } else {
      grunt.warn('No "' + prop + '" banner template defined.', 11);
      banner = '';
    }
    return banner;
  });

};
