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
var util = require('util');

// The module to be exported.
var log = module.exports = {};

// External lib. Requiring this here modifies the String prototype!
var colors = require('colors');

// Disable colors if --no-colors was passed.
log.initColors = function() {
  var util = grunt.util;
  if (grunt.option('no-color')) {
    // String color getters should just return the string.
    colors.mode = 'none';
    // Strip colors from strings passed to console.log.
    util.hooker.hook(console, 'log', function() {
      var args = util.toArray(arguments);
      return util.hooker.filter(this, args.map(function(arg) {
        return util.kindOf(arg) === 'string' ? colors.stripColors(arg) : arg;
      }));
    });
  }
};

// Temporarily suppress output.
var suppressOutput;

// Allow external muting of output.
log.muted = false;

// True once anything has actually been logged.
var hasLogged;

// Parse certain markup in strings to be logged.
function markup(str) {
  str = str || '';
  // Make _foo_ underline.
  str = str.replace(/(\s|^)_(\S|\S[\s\S]+?\S)_(?=[\s,.!?]|$)/g, '$1' + '$2'.underline);
  // Make *foo* bold.
  str = str.replace(/(\s|^)\*(\S|\S[\s\S]+?\S)\*(?=[\s,.!?]|$)/g, '$1' + '$2'.bold);
  return str;
}

// Similar to util.format in the standard library, however it'll always
// cast the first argument to a string and treat it as the format string.
function format(args) {
  // Args is a argument array so copy it in order to avoid wonky behavior.
  args = [].slice.call(args, 0);
  if (args.length > 0) {
    args[0] = String(args[0]);
  }
  return util.format.apply(util, args);
}

function write(msg) {
  msg = msg || '';
  // Actually write output.
  if (!log.muted && !suppressOutput) {
    hasLogged = true;
    // Users should probably use the colors-provided methods, but if they
    // don't, this should strip extraneous color codes.
    if (grunt.option('no-color')) { msg = colors.stripColors(msg); }
    // Actually write to stdout.
    process.stdout.write(markup(msg));
  }
}

function writeln(msg) {
  // Write blank line if no msg is passed in.
  msg = msg || '';
  write(msg + '\n');
}

// Write output.
log.write = function() {
  write(format(arguments));
  return log;
};

// Write a line of output.
log.writeln = function() {
  writeln(format(arguments));
  return log;
};

log.warn = function() {
  var msg = format(arguments);
  if (arguments.length > 0) {
    writeln('>> '.red + grunt.util._.trim(msg).replace(/\n/g, '\n>> '.red));
  } else {
    writeln('ERROR'.red);
  }
  return log;
};
log.error = function() {
  grunt.fail.errorcount++;
  log.warn.apply(log, arguments);
  return log;
};
log.ok = function() {
  var msg = format(arguments);
  if (arguments.length > 0) {
    writeln('>> '.green + grunt.util._.trim(msg).replace(/\n/g, '\n>> '.green));
  } else {
    writeln('OK'.green);
  }
  return log;
};
log.errorlns = function() {
  var msg = format(arguments);
  log.error(log.wraptext(77, msg));
  return log;
};
log.oklns = function() {
  var msg = format(arguments);
  log.ok(log.wraptext(77, msg));
  return log;
};
log.success = function() {
  var msg = format(arguments);
  writeln(msg.green);
  return log;
};
log.fail = function() {
  var msg = format(arguments);
  writeln(msg.red);
  return log;
};
log.header = function() {
  var msg = format(arguments);
  // Skip line before header, but not if header is the very first line output.
  if (hasLogged) { writeln(); }
  writeln(msg.underline);
  return log;
};
log.subhead = function() {
  var msg = format(arguments);
  // Skip line before subhead, but not if subhead is the very first line output.
  if (hasLogged) { writeln(); }
  writeln(msg.bold);
  return log;
};
// For debugging.
log.debug = function() {
  var msg = format(arguments);
  if (grunt.option('debug')) {
    writeln('[D] ' + msg.magenta);
  }
  return log;
};

// Write a line of a table.
log.writetableln = function(widths, texts) {
  writeln(log.table(widths, texts));
  return log;
};

// Wrap a long line of text to 80 columns.
log.writelns = function() {
  var msg = format(arguments);
  writeln(log.wraptext(80, msg));
  return log;
};

// Display flags in verbose mode.
log.writeflags = function(obj, prefix) {
  var wordlist;
  if (Array.isArray(obj)) {
    wordlist = log.wordlist(obj);
  } else if (typeof obj === 'object' && obj) {
    wordlist = log.wordlist(Object.keys(obj).map(function(key) {
      var val = obj[key];
      return key + (val === true ? '' : '=' + JSON.stringify(val));
    }));
  }
  writeln((prefix || 'Flags') + ': ' + (wordlist || '(none)'.cyan));
  return log;
};

// Create explicit "verbose" and "notverbose" functions, one for each already-
// defined log function, that do the same thing but ONLY if -v or --verbose is
// specified (or not specified).
log.verbose = {};
log.notverbose = {};

// Iterate over all exported functions.
Object.keys(log).filter(function(key) {
  return typeof log[key] === 'function';
}).forEach(function(key) {
  // Like any other log function, but suppresses output if the "verbose" option
  // IS NOT set.
  log.verbose[key] = function() {
    suppressOutput = !grunt.option('verbose');
    log[key].apply(log, arguments);
    suppressOutput = false;
    return log.verbose;
  };
  // Like any other log function, but suppresses output if the "verbose" option
  // IS set.
  log.notverbose[key] = function() {
    suppressOutput = grunt.option('verbose');
    log[key].apply(log, arguments);
    suppressOutput = false;
    return log.notverbose;
  };
});

// A way to switch between verbose and notverbose modes. For example, this will
// write 'foo' if verbose logging is enabled, otherwise write 'bar':
// verbose.write('foo').or.write('bar');
log.verbose.or = log.notverbose;
log.notverbose.or = log.verbose;

// Static methods.

// Pretty-format a word list.
log.wordlist = function(arr, options) {
  options = grunt.util._.defaults(options || {}, {
    separator: ', ',
    color: 'cyan'
  });
  return arr.map(function(item) {
    return options.color ? String(item)[options.color] : item;
  }).join(options.separator);
};

// Return a string, uncolored (suitable for testing .length, etc).
log.uncolor = function(str) {
  return str.replace(/\x1B\[\d+m/g, '');
};

// Word-wrap text to a given width, permitting ANSI color codes.
log.wraptext = function(width, text) {
  // notes to self:
  // grab 1st character or ansi code from string
  // if ansi code, add to array and save for later, strip from front of string
  // if character, add to array and increment counter, strip from front of string
  // if width + 1 is reached and current character isn't space:
  //  slice off everything after last space in array and prepend it to string
  //  etc

  // This result array will be joined on \n.
  var result = [];
  var matches, color, tmp;
  var captured = [];
  var charlen = 0;

  while (matches = text.match(/(?:(\x1B\[\d+m)|\n|(.))([\s\S]*)/)) {
    // Updated text to be everything not matched.
    text = matches[3];

    // Matched a color code?
    if (matches[1]) {
      // Save last captured color code for later use.
      color = matches[1];
      // Capture color code.
      captured.push(matches[1]);
      continue;

    // Matched a non-newline character?
    } else if (matches[2]) {
      // If this is the first character and a previous color code was set, push
      // that onto the captured array first.
      if (charlen === 0 && color) { captured.push(color); }
      // Push the matched character.
      captured.push(matches[2]);
      // Increment the current charlen.
      charlen++;
      // If not yet at the width limit or a space was matched, continue.
      if (charlen <= width || matches[2] === ' ') { continue; }
      // The current charlen exceeds the width and a space wasn't matched.
      // "Roll everything back" until the last space character.
      tmp = captured.lastIndexOf(' ');
      text = captured.slice(tmp === -1 ? tmp : tmp + 1).join('') + text;
      captured = captured.slice(0, tmp);
    }

    // The limit has been reached. Push captured string onto result array.
    result.push(captured.join(''));

    // Reset captured array and charlen.
    captured = [];
    charlen = 0;
  }

  result.push(captured.join(''));
  return result.join('\n');
};

// todo: write unit tests
//
// function logs(text) {
//   [4, 6, 10, 15, 20, 25, 30, 40].forEach(function(n) {
//     log(n, text);
//   });
// }
//
// function log(n, text) {
//   console.log(Array(n + 1).join('-'));
//   console.log(wrap(n, text));
// }
//
// var text = 'this is '.red + 'a simple'.yellow.inverse + ' test of'.green + ' ' + 'some wrapped'.blue + ' text over '.inverse.magenta + 'many lines'.red;
// logs(text);
//
// var text = 'foolish '.red.inverse + 'monkeys'.yellow + ' eating'.green + ' ' + 'delicious'.inverse.blue + ' bananas '.magenta + 'forever'.red;
// logs(text);
//
// var text = 'foolish monkeys eating delicious bananas forever'.rainbow;
// logs(text);

// Format output into columns, wrapping words as-necessary.
log.table = function(widths, texts) {
  var rows = [];
  widths.forEach(function(width, i) {
    var lines = log.wraptext(width, texts[i]).split('\n');
    lines.forEach(function(line, j) {
      var row = rows[j];
      if (!row) { row = rows[j] = []; }
      row[i] = line;
    });
  });

  var lines = [];
  rows.forEach(function(row) {
    var txt = '';
    var column;
    for (var i = 0; i < row.length; i++) {
      column = row[i] || '';
      txt += column;
      var diff = widths[i] - log.uncolor(column).length;
      if (diff > 0) { txt += grunt.util.repeat(diff, ' '); }
    }
    lines.push(txt);
  });

  return lines.join('\n');
};
