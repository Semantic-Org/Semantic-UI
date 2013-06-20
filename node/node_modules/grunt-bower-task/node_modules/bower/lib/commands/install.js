// ==========================================
// BOWER: Install API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter = require('events').EventEmitter;
var nopt    = require('nopt');
var fs      = require('fs');
var path    = require('path');

var Manager = require('../core/manager');
var config  = require('../core/config');
var source  = require('../core/source');
var save    = require('../util/save');
var help    = require('./help');

var optionTypes = { help: Boolean, save: Boolean, 'save-dev': Boolean, force: Boolean, 'force-latest': Boolean, production: Boolean };
var shorthand   = { 'h': ['--help'], 'S': ['--save'], 'D': ['--save-dev'], 'f': ['--force'], 'F': ['--force-latest'], 'p': ['--production'] };

module.exports = function (paths, options) {
  options = options || {};

  var emitter = new Emitter;
  var manager = new Manager(paths, {
    force: options.force,
    forceLatest: options['force-latest'],
    production: options.production
  });

  manager
    .on('data', emitter.emit.bind(emitter, 'data'))
    .on('warn', emitter.emit.bind(emitter, 'warn'))
    .on('error', emitter.emit.bind(emitter, 'error'))
    .on('resolve', function (resolved) {
      // Handle save/save-dev
      if (resolved && (options.save || options['save-dev'])) {
        save(manager, paths, !options.save, emitter.emit.bind(emitter, 'end'));
      } else {
        emitter.emit('end');
      }
    })
    .resolve();

  return emitter;
};

module.exports.line = function (argv) {
  var options = nopt(optionTypes, shorthand, argv);
  var paths   = options.argv.remain.slice(1);

  if (options.help) return help('install');
  return module.exports(paths, options);
};

module.exports.completion = function (opts, cb) {
  var cache = path.join(config.completion, 'install.json');
  var done = function done(err, results) {
    if (err) return cb(err);
    var names = results.map(function (pkg) {
      return pkg.name;
    });

    return cb(null, names);
  };

  fs.readFile(cache, function (err, body) {
    if (!err) return done(null, JSON.parse(body));

    // expected error, do the first request and cache the results
    source.all(function (err, results) {
      if (err) return cb(err);
      fs.writeFile(cache, JSON.stringify(results, null, 2), function (err) {
        done(err, results);
      });
    });
  });
};

module.exports.completion.options = shorthand;
