/*
 * grunt-lib-contrib
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

exports.init = function(grunt) {
  'use strict';

  var exports = {};

  var path = require('path');

  exports.getNamespaceDeclaration = function(ns) {
    var output = [];
    var curPath = 'this';
    if (ns !== 'this') {
      var nsParts = ns.split('.');
      nsParts.forEach(function(curPart, index) {
        if (curPart !== 'this') {
          curPath += '[' + JSON.stringify(curPart) + ']';
          output.push(curPath + ' = ' + curPath + ' || {};');
        }
      });
    }

    return {
      namespace: curPath,
      declaration: output.join('\n')
    };
  };

  // Convert an object to an array of CLI arguments
  exports.optsToArgs = function(options) {
    var args = [];

    Object.keys(options).forEach(function(flag) {
      var val = options[flag];

      flag = flag.replace(/[A-Z]/g, function(match) {
        return '-' + match.toLowerCase();
      });

      if (val === true) {
        args.push('--' + flag);
      }

      if (grunt.util._.isString(val)) {
        args.push('--' + flag, val);
      }

      if (grunt.util._.isNumber(val)) {
        args.push('--' + flag, '' + val);
      }

      if (grunt.util._.isArray(val)) {
        val.forEach(function(arrVal) {
          args.push('--' + flag, arrVal);
        });
      }
    });

    return args;
  };

  // Strip a path from a path. normalize both paths for best results.
  exports.stripPath = function(pth, strip) {
    if (strip && strip.length >= 1) {
      strip = path.normalize(strip);
      pth = path.normalize(pth);
      pth = grunt.util._(pth).strRight(strip);
      pth = grunt.util._(pth).ltrim(path.sep);
    }

    return pth;
  };

  // Log min and max info
  function gzipSize(src) {
    return src ? require('zlib-browserify').gzipSync(src).length : 0;
  }
  exports.minMaxInfo = function(min, max, report) {
    if (report === 'min' || report === 'gzip') {
      grunt.log.writeln('Original: ' + String(max.length).green + ' bytes.');
      grunt.log.writeln('Minified: ' + String(min.length).green + ' bytes.');
    }
    if (report === 'gzip') {
      // Note this option is pretty slow so it is not enabled by default
      grunt.log.write('Gzipped:  ');
      grunt.log.writeln(String(gzipSize(min)).green + ' bytes.');
    }
  };

  exports.formatForType = function(string, type, namespace, filename) {
    namespace = namespace || false;

    if (type === 'amd' && namespace === false) {
      string = 'return ' + string;
    } else if (type === 'commonjs' && namespace === false) {
      string = 'module.exports = ' + string;
    } else if (type === 'amd' && namespace !== false || type === 'commonjs' && namespace !== false || type === 'js' && namespace !== false) {
      string = namespace+'['+JSON.stringify(filename)+'] = '+string+';';
    }

    return string;
  };

  return exports;
};
