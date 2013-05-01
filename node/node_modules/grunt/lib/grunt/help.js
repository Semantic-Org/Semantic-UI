/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

var grunt = require('../grunt');

// Nodejs libs.
var path = require('path');

// Initialize task system so that the tasks can be listed.
grunt.task.init([], {help: true});

// Build 2-column array for table view.
var col1len = 0;
var opts = Object.keys(grunt.cli.optlist).map(function(long) {
  var o = grunt.cli.optlist[long];
  var col1 = '--' + (o.negate ? 'no-' : '') + long + (o.short ? ', -' + o.short : '');
  col1len = Math.max(col1len, col1.length);
  return [col1, o.info];
});

var tasks = Object.keys(grunt.task._tasks).map(function(name) {
  col1len = Math.max(col1len, name.length);
  var info = grunt.task._tasks[name].info;
  if (grunt.task._tasks[name].multi) {
    info += ' *';
  }
  return [name, info];
});

// Actually write out help screen.
grunt.log.writeln('grunt: a task-based command line build tool for JavaScript projects. (v' + grunt.version + ')');

grunt.log.header('Usage');
grunt.log.writeln(' ' + path.basename(process.argv[1]) + ' [options] [task [task ...]]');

// Widths for options/tasks table output.
var widths = [1, col1len, 2, 76 - col1len];

grunt.log.header('Options');
opts.forEach(function(a) { grunt.log.writetableln(widths, ['', grunt.utils._.pad(a[0], col1len), '', a[1]]); });

grunt.log.writeln().writelns(
  'Options marked with * have methods exposed via the grunt API and should ' +
  'instead be specified inside the "grunt.js" gruntfile wherever possible.'
);

grunt.log.header('Available tasks');
tasks.forEach(function(a) { grunt.log.writetableln(widths, ['', grunt.utils._.pad(a[0], col1len), '', a[1]]); });

grunt.log.writeln().writelns(
  'Tasks run in the order specified. Arguments may be passed to tasks that ' +
  'accept them by using semicolons, like "lint:files". Tasks marked with * ' +
  'are "multi tasks" and will iterate over all sub-targets if no argument is ' +
  'specified.' +
  '\n\n' +
  'The list of available tasks may change based on tasks directories or ' +
  'grunt plugins specified in the "grunt.js" gruntfile or via command-line ' +
  'options.' +
  '\n\n' +
  'For more information, see http://gruntjs.com/'
);

process.exit();
