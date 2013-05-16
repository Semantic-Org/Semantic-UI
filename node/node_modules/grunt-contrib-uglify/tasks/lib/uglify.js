/*
 * grunt-contrib-uglify
 * https://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

// External libs.
var UglifyJS = require('uglify-js');
var fs = require('fs');

exports.init = function(grunt) {
  var exports = {};

  // Minify with UglifyJS.
  // From https://github.com/mishoo/UglifyJS2
  // API docs at http://lisperator.net/uglifyjs/
  exports.minify = function(files, dest, options) {
    options = options || {};

    grunt.verbose.write('Minifying with UglifyJS...');

    var topLevel = null;
    var totalCode = '';

    var outputOptions = getOutputOptions(options, dest);
    var output = UglifyJS.OutputStream(outputOptions);

    // Grab and parse all source files
    files.forEach(function(file){
      var code = grunt.file.read(file);
      if (typeof options.sourceMapPrefix !== 'undefined') {
        file = file.replace(/^\/+/, "").split(/\/+/).slice(options.sourceMapPrefix).join("/");
      }
      totalCode += code;
      topLevel = UglifyJS.parse(code, {
        filename: file,
        toplevel: topLevel
      });
    });

    // Wrap code in a common js wrapper.
    if (options.wrap) {
      topLevel = topLevel.wrap_commonjs(options.wrap, options.exportAll);
    }

    // Need to call this before we mangle or compress,
    // and call after any compression or ast altering
    topLevel.figure_out_scope();

    if (options.compress !== false) {
      if (options.compress.warnings !== true) {
        options.compress.warnings = false;
      }
      var compressor = UglifyJS.Compressor(options.compress);
      topLevel = topLevel.transform(compressor);

      // Need to figure out scope again after source being altered
      topLevel.figure_out_scope();
    }

    if (options.mangle !== false) {
      // compute_char_frequency optimizes names for compression
      topLevel.compute_char_frequency(options.mangle);

      // Requires previous call to figure_out_scope
      // and should always be called after compressor transform
      topLevel.mangle_names(options.mangle);
    }

    // Print the ast to OutputStream
    topLevel.print(output);

    var min = output.get();

    if (options.sourceMappingURL || options.sourceMap) {
      min += '\n//@ sourceMappingURL=' + (options.sourceMappingURL || options.sourceMap);
    }

    var result = {
      max: totalCode,
      min: min,
      sourceMap: outputOptions.source_map
    };

    grunt.verbose.ok();

    return result;
  };

  var getOutputOptions = function(options, dest) {
    var outputOptions = {
      beautify: false,
      source_map: null
    };

    if (options.preserveComments) {
      if (options.preserveComments === 'all' || options.preserveComments === true) {

        // preserve all the comments we can
        outputOptions.comments = true;
      } else if (options.preserveComments === 'some') {

        // preserve comments with directives or that start with a bang (!)
        outputOptions.comments = function(node, comment) {
          return (/^!|@preserve|@license|@cc_on/i).test(comment.value);
        };
      } else if (grunt.util._.isFunction(options.preserveComments)) {

        // support custom functions passed in
        outputOptions.comments = options.preserveComments;
      }
    }

    if (options.beautify) {
      if (grunt.util._.isObject(options.beautify)) {
        // beautify options sent as an object are merged
        // with outputOptions and passed to the OutputStream
        grunt.util._.extend(outputOptions, options.beautify);
      } else {
        outputOptions.beautify = true;
      }
    }


    if (options.sourceMap) {
      var sourceMapIn;
      if (options.sourceMapIn) {
        sourceMapIn = grunt.file.readJSON(options.sourceMapIn);
      }
      outputOptions.source_map = UglifyJS.SourceMap({
        file: dest,
        root: options.sourceMapRoot,
        orig: sourceMapIn
      });
    }

    return outputOptions;
  };

  return exports;
};
