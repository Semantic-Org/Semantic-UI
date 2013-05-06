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
var path = require('path');

// This allows grunt to require() .coffee files.
require('coffee-script');

// The module to be exported.
var grunt = module.exports = {};

// Expose internal grunt libs.
function gRequire(name) {
  return grunt[name] = require('./grunt/' + name);
}
var util = gRequire('util');
gRequire('template');
gRequire('event');
var fail = gRequire('fail');
gRequire('file');
var option = gRequire('option');
var config = gRequire('config');
var task = gRequire('task');
var log = gRequire('log');
var help = gRequire('help');
gRequire('cli');
var verbose = grunt.verbose = log.verbose;

// Expose some grunt metadata.
grunt.package = require('../package.json');
grunt.version = grunt.package.version;

// Expose specific grunt lib methods on grunt.
function gExpose(obj, methodName, newMethodName) {
  grunt[newMethodName || methodName] = obj[methodName].bind(obj);
}
gExpose(task, 'registerTask');
gExpose(task, 'registerMultiTask');
gExpose(task, 'registerInitTask');
gExpose(task, 'renameTask');
gExpose(task, 'loadTasks');
gExpose(task, 'loadNpmTasks');
gExpose(config, 'init', 'initConfig');
gExpose(fail, 'warn');
gExpose(fail, 'fatal');

// Expose the task interface. I've never called this manually, and have no idea
// how it will work. But it might.
grunt.tasks = function(tasks, options, done) {
  // Update options with passed-in options.
  option.init(options);

  // Display the grunt version and quit if the user did --version.
  var _tasks, _options;
  if (option('version')) {
    // Not --verbose.
    log.writeln('grunt v' + grunt.version);

    if (option('verbose')) {
      // --verbose
      verbose.writeln('Install path: ' + path.resolve(__dirname, '..'));
      // Yes, this is a total hack, but we don't want to log all that verbose
      // task initialization stuff here.
      grunt.log.muted = true;
      // Initialize task system so that available tasks can be listed.
      grunt.task.init([], {help: true});
      // Re-enable logging.
      grunt.log.muted = false;

      // Display available tasks (for shell completion, etc).
      _tasks = Object.keys(grunt.task._tasks).sort();
      verbose.writeln('Available tasks: ' + _tasks.join(' '));

      // Display available options (for shell completion, etc).
      _options = [];
      Object.keys(grunt.cli.optlist).forEach(function(long) {
        var o = grunt.cli.optlist[long];
        _options.push('--' + (o.negate ? 'no-' : '') + long);
        if (o.short) { _options.push('-' + o.short); }
      });
      verbose.writeln('Available options: ' + _options.join(' '));
    }

    return;
  }

  // Init colors.
  log.initColors();

  // Display help and quit if the user did --help.
  if (option('help')) {
    help.display();
    return;
  }

  // A little header stuff.
  verbose.header('Initializing').writeflags(option.flags(), 'Command-line options');

  // Determine and output which tasks will be run.
  var tasksSpecified = tasks && tasks.length > 0;
  tasks = task.parseArgs([tasksSpecified ? tasks : 'default']);

  // Initialize tasks.
  task.init(tasks);

  verbose.writeln();
  if (!tasksSpecified) {
    verbose.writeln('No tasks specified, running default tasks.');
  }
  verbose.writeflags(tasks, 'Running tasks');

  // Handle otherwise unhandleable (probably asynchronous) exceptions.
  var uncaughtHandler = function(e) {
    fail.fatal(e, fail.code.TASK_FAILURE);
  };
  process.on('uncaughtException', uncaughtHandler);

  // Report, etc when all tasks have completed.
  task.options({
    error: function(e) {
      fail.warn(e, fail.code.TASK_FAILURE);
    },
    done: function() {
      // Stop handling uncaught exceptions so that we don't leave any
      // unwanted process-level side effects behind. There is no need to do
      // this in the error callback, because fail.warn() will either kill
      // the process, or with --force keep on going all the way here.
      process.removeListener('uncaughtException', uncaughtHandler);

      // Output a final fail / success report.
      fail.report();

      if (done) {
        // Execute "done" function when done (only if passed, of course).
        done();
      } else {
        // Otherwise, explicitly exit.
        util.exit(0);
      }
    }
  });

  // Execute all tasks, in order. Passing each task individually in a forEach
  // allows the error callback to execute multiple times.
  tasks.forEach(function(name) { task.run(name); });
  task.start();
};
