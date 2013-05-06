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

// Nodejs libs.
var path = require('path');

// Set column widths.
var col1len = 0;
exports.initCol1 = function(str) {
  col1len = Math.max(col1len, str.length);
};
exports.initWidths = function() {
  // Widths for options/tasks table output.
  exports.widths = [1, col1len, 2, 76 - col1len];
};

// Render an array in table form.
exports.table = function(arr) {
  arr.forEach(function(item) {
    grunt.log.writetableln(exports.widths, ['', grunt.util._.pad(item[0], col1len), '', item[1]]);
  });
};

// Methods to run, in-order.
exports.queue = [
  'initOptions',
  'initTasks',
  'initWidths',
  'header',
  'usage',
  'options',
  'optionsFooter',
  'tasks',
  'footer',
];

// Actually display stuff.
exports.display = function() {
  exports.queue.forEach(function(name) { exports[name](); });
};


// Header.
exports.header = function() {
  grunt.log.writeln('Grunt: The JavaScript Task Runner (v' + grunt.version + ')');
};

// Usage info.
exports.usage = function() {
  grunt.log.header('Usage');
  grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' [options] [task [task ...]]');
};

// Options.
exports.initOptions = function() {
  // Build 2-column array for table view.
  exports._options = Object.keys(grunt.cli.optlist).map(function(long) {
    var o = grunt.cli.optlist[long];
    var col1 = '--' + (o.negate ? 'no-' : '') + long + (o.short ? ', -' + o.short : '');
    exports.initCol1(col1);
    return [col1, o.info];
  });
};

exports.options = function() {
  grunt.log.header('Options');
  exports.table(exports._options);
};

exports.optionsFooter = function() {
  grunt.log.writeln().writelns(
    'Options marked with * have methods exposed via the grunt API and should ' +
    'instead be specified inside the Gruntfile wherever possible.'
  );
};

// Tasks.
exports.initTasks = function() {
  // Initialize task system so that the tasks can be listed.
  grunt.task.init([], {help: true});

  // Build object of tasks by info (where they were loaded from).
  exports._tasks = [];
  Object.keys(grunt.task._tasks).forEach(function(name) {
    exports.initCol1(name);
    var task = grunt.task._tasks[name];
    exports._tasks.push(task);
  });
};

exports.tasks = function() {
  grunt.log.header('Available tasks');
  if (exports._tasks.length === 0) {
    grunt.log.writeln('(no tasks found)');
  } else {
    exports.table(exports._tasks.map(function(task) {
      var info = task.info;
      if (task.multi) { info += ' *'; }
      return [task.name, info];
    }));

    grunt.log.writeln().writelns(
      'Tasks run in the order specified. Arguments may be passed to tasks that ' +
      'accept them by using colons, like "lint:files". Tasks marked with * are ' +
      '"multi tasks" and will iterate over all sub-targets if no argument is ' +
      'specified.'
    );
  }

  grunt.log.writeln().writelns(
    'The list of available tasks may change based on tasks directories or ' +
    'grunt plugins specified in the Gruntfile or via command-line options.'
  );
};

// Footer.
exports.footer = function() {
  grunt.log.writeln().writeln('For more information, see http://gruntjs.com/');
};
