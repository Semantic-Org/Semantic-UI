// ==========================================
// BOWER: Lookup API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter  = require('events').EventEmitter;
var nopt     = require('nopt');
var readline = require('readline');

var template = require('../util/template');
var source   = require('../core/source');
var help     = require('./help');

var optionTypes = { help: Boolean };
var shorthand   = { 'h': ['--help'], '-s': ['--silent'] };

var register = function (name, url, emitter)  {
  source.register(name, url, function (err) {
    if (err) return emitter.emit('error', err);

    template('register', {name: name, url: url})
      .on('data', emitter.emit.bind(emitter, 'data'));
  });
};

module.exports = function (name, url, options) {
  var emitter = new Emitter;

  if (options.silent) register(name, url, emitter);
  else {
    var rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('Registering a package will make it visible and installable via the registry.');
    rl.question('Proceed (y/n)? ', function (res) {
      rl.close();

      res = res.toLowerCase();

      if (res === 'y' || res === 'yes') register(name, url, emitter);
    });
  }

  return emitter;
};

module.exports.line = function (argv) {
  var options  = nopt(optionTypes, shorthand, argv);
  var args     = options.argv.remain.slice(1);

  if (options.help || args.length !== 2) return help('register');
  return module.exports(args[0], args[1], options);
};

module.exports.completion = function (opts, cb) {
  var word = opts.word;

  // completing options?
  if (word.charAt(0) === '-') {
    return cb(null, Object.keys(optionTypes).map(function (option) {
      return '--' + option;
    }));
  }
};
