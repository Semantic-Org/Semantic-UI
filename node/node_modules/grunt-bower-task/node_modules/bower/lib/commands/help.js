// ==========================================
// BOWER: Help API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var events = require('events');
var nopt   = require('nopt');
var _      = require('lodash');

var template  = require('../util/template');
var config    = require('../core/config');

module.exports = function (name) {
  var context      = {};
  var emitter      = new events.EventEmitter;
  var commands     = require('../commands');

  // Aliases
  // At the moment we just have the ls, but we might have more
  switch (name) {
  case 'ls':
    name = 'list';
    break;
  }

  var validCommand = !!(name  && commands[name]);
  var templateName = validCommand ? 'help-' + name : 'help';

  if (!validCommand) context = {
    commands: Object.keys(commands).sort().join(', ')
  }

  _.extend(context, config);

  template(templateName, context)
    .on('data', emitter.emit.bind(emitter, 'end'));

  return emitter;
};

module.exports.line = function (argv) {
  var options  = nopt({}, {}, argv);
  var paths    = options.argv.remain.slice(1);
  return module.exports(paths[0]);
};

module.exports.completion = function (opts, cb) {
  return cb(null, Object.keys(require('../commands')));
};
