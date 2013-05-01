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
var util = require('util');

// The module to be exported.
var log = module.exports = {};

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
  str = str.replace(/(\s|^)_([\s\S]+?)_(?=\s|$)/g, '$1' + '$2'.underline);
  // Make *foo* bold.
  str = str.replace(/(\s|^)\*([\s\S]+?)\*(?=\s|$)/g, '$1' + '$2'.bold);
  return str;
}

// Write output.
log.write = function(msg) {
  // Actually write output.
  if (!log.muted && !suppressOutput) {
    hasLogged = true;
    process.stdout.write(markup(msg));
  }
  // Chainable!
  return this;
};

// Write a line of output.
log.writeln = function(msg) {
  // Actually write output.
  this.write((msg || '') + '\n');
  // Chainable!
  return this;
};

// Stuff.

log.error = function(msg) {
  if (msg) {
    grunt.fail.errorcount++;
    return this.writeln('>> '.red + grunt.utils._.trim(msg).replace(/\n/g, '\n>> '.red));
  } else {
    return this.writeln('ERROR'.red);
  }
};
log.ok = function(msg) {
  if (msg) {
    return this.writeln('>> '.green + grunt.utils._.trim(msg).replace(/\n/g, '\n>> '.green));
  } else {
    return this.writeln('OK'.green);
  }
};
log.errorlns = function(msg) { return this.error(log.wraptext(77, msg)); };
log.oklns = function(msg) { return this.ok(log.wraptext(77, msg)); };
log.success = function(msg) { return this.writeln(msg.green); };
log.fail = function(msg) { return this.writeln(msg.red); };
log.header = function(msg) {
  // Skip line before header, but not if header is the very first line output.
  if (hasLogged) { this.writeln(); }
  return this.writeln(msg.underline);
};
log.subhead = function(msg) {
  // Skip line before subhead, but not if subhead is the very first line output.
  if (hasLogged) { this.writeln(); }
  return this.writeln(msg.bold);
};
// For debugging.
log.debug = function() {
  if (grunt.option('debug')) {
    this.writeln(('[D] ' + util.format.apply(this, arguments)).magenta);
  }
  return this;
};

// Write a line of a table.
log.writetableln = function(widths, texts) {
  return this.writeln(this.table(widths, texts));
};

// Wrap a long line of text to 80 columns.
log.writelns = function(msg) {
  return this.writeln(this.wraptext(80, msg));
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
  return this.writeln((prefix || 'Flags') + ': ' + (wordlist || '(none)'.cyan));
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
    log[key].apply(this, arguments);
    suppressOutput = false;
    return this;
  };
  // Like any other log function, but suppresses output if the "verbose" option
  // IS set.
  log.notverbose[key] = function() {
    suppressOutput = grunt.option('verbose');
    log[key].apply(this, arguments);
    suppressOutput = false;
    return this;
  };
});

// A way to switch between verbose and notverbose modes. For example, this will
// write 'foo' if verbose logging is enabled, otherwise write 'bar':
// verbose.write('foo').or.write('bar');
log.verbose.or = log.notverbose;
log.notverbose.or = log.verbose;

// Static methods.

// Pretty-format a word list.
log.wordlist = function(arr, separator) {
  return arr.map(function(item) {
    return item.cyan;
  }).join(separator || ', ');
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
      if (diff > 0) { txt += grunt.utils.repeat(diff, ' '); }
    }
    lines.push(txt);
  });

  return lines.join('\n');
};
