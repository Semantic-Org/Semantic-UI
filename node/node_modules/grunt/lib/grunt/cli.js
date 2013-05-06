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

// External libs.
var nopt = require('nopt');

// This is only executed when run via command line.
var cli = module.exports = function(options, done) {
  // CLI-parsed options override any passed-in "default" options.
  if (options) {
    // For each defult option...
    Object.keys(options).forEach(function(key) {
      if (!(key in cli.options)) {
        // If this option doesn't exist in the parsed cli.options, add it in.
        cli.options[key] = options[key];
      } else if (cli.optlist[key].type === Array) {
        // If this option's type is Array, append it to any existing array
        // (or create a new array).
        [].push.apply(cli.options[key], options[key]);
      }
    });
  }

  // Run tasks.
  grunt.tasks(cli.tasks, cli.options, done);
};

// Default options.
var optlist = cli.optlist = {
  help: {
    short: 'h',
    info: 'Display this help text.',
    type: Boolean
  },
  base: {
    info: 'Specify an alternate base path. By default, all file paths are relative to the Gruntfile. (grunt.file.setBase) *',
    type: path
  },
  color: {
    info: 'Disable colored output.',
    type: Boolean,
    negate: true
  },
  gruntfile: {
    info: 'Specify an alternate Gruntfile. By default, grunt looks in the current or parent directories for the nearest Gruntfile.js or Gruntfile.coffee file.',
    type: path
  },
  debug: {
    short: 'd',
    info: 'Enable debugging mode for tasks that support it.',
    type: Number
  },
  stack: {
    info: 'Print a stack trace when exiting with a warning or fatal error.',
    type: Boolean
  },
  force: {
    short: 'f',
    info: 'A way to force your way past warnings. Want a suggestion? Don\'t use this option, fix your code.',
    type: Boolean
  },
  tasks: {
    info: 'Additional directory paths to scan for task and "extra" files. (grunt.loadTasks) *',
    type: Array
  },
  npm: {
    info: 'Npm-installed grunt plugins to scan for task and "extra" files. (grunt.loadNpmTasks) *',
    type: Array
  },
  write: {
    info: 'Disable writing files (dry run).',
    type: Boolean,
    negate: true
  },
  verbose: {
    short: 'v',
    info: 'Verbose mode. A lot more information output.',
    type: Boolean
  },
  version: {
    short: 'V',
    info: 'Print the grunt version. Combine with --verbose for more info.',
    type: Boolean
  },
  // Even though shell auto-completion is now handled by grunt-cli, leave this
  // option here for display in the --help screen.
  completion: {
    info: 'Output shell auto-completion rules. See the grunt-cli documentation for more information.',
    type: String
  },
};

// Parse `optlist` into a form that nopt can handle.
var aliases = {};
var known = {};

Object.keys(optlist).forEach(function(key) {
  var short = optlist[key].short;
  if (short) {
    aliases[short] = '--' + key;
  }
  known[key] = optlist[key].type;
});

var parsed = nopt(known, aliases, process.argv, 2);
cli.tasks = parsed.argv.remain;
cli.options = parsed;
delete parsed.argv;

// Initialize any Array options that weren't initialized.
Object.keys(optlist).forEach(function(key) {
  if (optlist[key].type === Array && !(key in cli.options)) {
    cli.options[key] = [];
  }
});
