// ==========================================
// BOWER: completion
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

// This module exposes a simple helper to parse the environment variables in
// case of a tab completion command. It parses the provided `argv` (nopt's
// remain arguments after `--`) and `env` (should be process.env)
//
// It is inspired and based off Isaac's work on npm.

module.exports = function (argv, env) {
  var opts = {};

  // w is the words number, based on the cursor position
  opts.w = +env.COMP_CWORD;

  // words is the escaped sequence of words following `bower`
  opts.words = argv.map(function (word) {
    return word.charAt(0) === '"' ?
      word.replace(/^"|"$/g, '') :
      word.replace(/\\ /g, ' ');
  });

  // word is a shortcut to the last word in the line
  opts.word = opts.words[opts.w - 1];

  // line is the sequence of tab completed words.
  opts.line = env.COMP_LINE;

  // point is the cursor position in the line
  opts.point = +env.COMP_POINT;

  // length is the whole line's length.
  opts.length = opts.line.length;

  // partialLine is the line ignoring the sequence of characters after
  // cursor position, ie. tabbing at: bower install j|qu
  // gives back a partialLine: bower install j
  opts.partialLine = opts.line.slice(0, opts.point);

  // partialWords is only returning the words based on cursor position,
  // ie tabbing at: bower install ze|pto backbone
  // gives back a partialWords array: ['install', 'zepto']
  opts.partialWords = opts.words.slice(0, opts.w);

  return opts;
};

module.exports.log = function (arr, opts) {
  arr = Array.isArray(arr) ? arr : [arr];
  arr.filter(module.exports.abbrev(opts)).forEach(function (word) {
    console.log(word);
  });
};

module.exports.abbrev = function abbrev(opts) {
  var word = opts.word.replace(/\./g, '\\.');
  return function (it) {
    return new RegExp('^' + word).test(it);
  };
};
