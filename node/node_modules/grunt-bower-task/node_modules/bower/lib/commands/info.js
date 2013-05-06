// ==========================================
// BOWER: Lookup API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter  = require('events').EventEmitter;
var nopt     = require('nopt');

var template = require('../util/template');
var source   = require('../core/source');
var install  = require('./install');
var help     = require('./help');

var optionTypes = { help: Boolean };
var shorthand   = { 'h': ['--help'] };

module.exports = function (name) {
  var emitter = new Emitter;

  if (name) {
    source.info(name, function (err, result) {
      if (err) return emitter.emit('error', err);
      emitter.emit('end', result);
    });
  }

  return emitter;
};

module.exports.line = function (argv) {
  var emitter  = new Emitter;
  var options  = nopt(optionTypes, shorthand, argv);
  var names    = options.argv.remain.slice(1);

  if (options.help || !names.length) return help('info');

  module.exports(names[0])
    .on('error', emitter.emit.bind(emitter, 'error'))
    .on('end', function (data) {
      template('info', data).on('data', emitter.emit.bind(emitter, 'end'));
    });

  return emitter;
};

module.exports.completion = install.completion;
module.exports.completion.options = shorthand;
