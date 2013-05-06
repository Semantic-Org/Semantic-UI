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

  source.lookup(name, function (err, url) {
    if (err) {
      source.search(name, function (err, packages) {
        if (packages.length) {
          template('suggestions', { packages: packages, name: name })
            .on('data', function (data) {
              emitter.emit('data', data);
              emitter.emit('end');
            });
        } else {
          template('warning-missing', {name: name})
            .on('data', function (data) {
              emitter.emit('data', data);
              emitter.emit('end');
            });
        }
      });
    } else {
      var result = { name: name, url: url };
      emitter.emit('package', result);

      template('lookup', result)
        .on('data', function (data) {
          emitter.emit('data', data);
          emitter.emit('end');
        });
    }
  });

  return emitter;
};

module.exports.line = function (argv) {
  var options  = nopt(optionTypes, shorthand, argv);
  var names    = options.argv.remain.slice(1);

  if (options.help || !names.length) return help('lookup');
  return module.exports(names[0]);
};

module.exports.completion = install.completion;
module.exports.completion.options = shorthand;
