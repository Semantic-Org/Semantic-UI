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
var fail = module.exports = {};

// Error codes
// 1. Generic error.
// 2. Config file not found.
// 3. Generic task failed.
// 10. Uglify-JS error.
// 11. Banner generation error.
// 20. Init error.
// 90-99. Nodeunit/QUnit errors.

// DRY it up!
function writeln(e, mode) {
  grunt.log.muted = false;
  // Pretty colors.
  var tags = {
    warn: ['<'.red + 'WARN'.yellow + '>'.red, '</'.red + 'WARN'.yellow + '>'.red],
    fatal: ['<'.red + 'FATAL'.yellow + '>'.red, '</'.red + 'FATAL'.yellow + '>'.red]
  };
  var msg = String(e.message || e) + '\x07'; // Beep!
  if (mode === 'warn') {
    msg += ' ' + (grunt.option('force') ? 'Used --force, continuing.'.underline : 'Use --force to continue.');
  }
  grunt.log.writeln([tags[mode][0], msg.yellow, tags[mode][1]].join(' '));
}

// A fatal error occured. Abort immediately.
fail.fatal = function(e, errcode) {
  writeln(e, 'fatal');
  process.exit(typeof errcode === 'number' ? errcode : 1);
};

// Keep track of error and warning counts.
fail.errorcount = 0;
fail.warncount = 0;

// Something (like the watch task) can override this to perform an alternate
// action to exiting on warn.
fail.warnAlternate = null;

// A warning ocurred. Abort immediately unless -f or --force was used.
fail.warn = function(e, errcode) {
  var message = typeof e === 'string' ? e : e.message;
  fail.warncount++;
  writeln(message, 'warn');
  // If -f or --force aren't used, stop script processing.
  if (!grunt.option('force')) {
    if (fail.warnAlternate) {
      fail.warnAlternate();
    } else {
      // If --debug is enabled, log the appropriate error stack (if it exists).
      if (grunt.option('debug') >= 9) {
        if (e.origError && e.origError.stack) {
          console.log(e.origError.stack);
        } else if (e.stack) {
          console.log(e.stack);
        }
      }
      // Log and exit.
      grunt.log.writeln().fail('Aborted due to warnings.');
      process.exit(typeof errcode === 'number' ? errcode : 2);
    }
  }
};

// This gets called at the very end.
fail.report = function() {
  if (fail.warncount > 0) {
    grunt.log.writeln().fail('Done, but with warnings.');
  } else {
    grunt.log.writeln().success('Done, without errors.');
  }
};
