// ==========================================
// BOWER: Completion API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter  = require('events').EventEmitter;
var path     = require('path');
var nopt     = require('nopt');
var mkdirp   = require('mkdirp');

var template = require('../util/template');
var complete = require('../util/completion');
var config   = require('../core/config');
var help     = require('./help');

var optionTypes = { help: Boolean };
var shorthand   = { 'h': ['--help'] };

module.exports = function (argv, env) {
  env = env || process.env;

  var emitter = new Emitter;
  var commands = require('../commands');

  // top level flags
  var flags = ['--no-color', '--help', '--version'];

  var done = function done() {
    process.nextTick(function () {
      emitter.emit('end');
    });

    return emitter;
  };

  // if the COMP_* isn't in the env, then just dump the script.
  if (!env.COMP_CWORD) {
    template('completion').on('data', emitter.emit.bind(emitter, 'end'));
    return emitter;
  }

  // parse environment and arguments, returns a hash of completion config.
  var opts = complete(argv, env);

  // if only one word, complete the list of command or top level flags
  if (opts.w === 1) {
    if (opts.word.charAt(0) === '-') complete.log(flags, opts);
    else complete.log(Object.keys(commands), opts);
    return done();
  }

  // try to find the bower command. first thing after all the configs.
  var parsed = opts.conf = nopt({}, {}, opts.partialWords, 0);
  var cmd = parsed.argv.remain[0];

  // unable to find a command, complete the lisf of commands
  if (!cmd) {
    complete.log(Object.keys(commands), opts);
    return done();
  }

  // if words[0] is a bower command, then complete on it.
  cmd = commands[cmd];

  if (cmd && cmd.completion) {
    // prior to that, ensure the completion cache directory is created first
    mkdirp(path.join(config.completion), function (err) {
      if (err) return emitter.emit('error', err);

      var options = cmd.completion.options;
      if (options && opts.word.charAt(0) === '-') {
        complete.log(Object.keys(options).map(function (option) {
          return opts.word.charAt(1) === '-' ? options[option][0] : '-' + option;
        }), opts);
        return done();
      }

      cmd.completion(opts, function (err, data) {
        if (err) return emitter.emit('error', err);

        // completing options, then append top level flags
        if (opts.word.charAt(0) === '-') data = data.concat(flags);

        complete.log(data, opts);

        done();
      });
    });

    return emitter;
  }

  // otherwise, do nothing
  return emitter;
};

module.exports.line = function (argv) {
  var emitter  = new Emitter;
  var options  = nopt(optionTypes, shorthand, argv);

  if (options.help) return help('completion');

  module.exports(options.argv.remain.slice(2), process.env)
    .on('data', emitter.emit.bind(emitter, 'data'))
    .on('error', emitter.emit.bind(emitter, 'error'))
    .on('end', emitter.emit.bind(emitter, 'end'));

  return emitter;
};
