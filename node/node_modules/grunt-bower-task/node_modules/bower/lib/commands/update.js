// ==========================================
// BOWER: Update API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter = require('events').EventEmitter;
var async   = require('async');
var nopt    = require('nopt');
var _       = require('lodash');

var Manager   = require('../core/manager');
var help      = require('./help');
var uninstall = require('./uninstall');
var save      = require('../util/save');

var optionTypes = { help: Boolean, save: Boolean, force: Boolean, 'force-latest': Boolean };
var shorthand   = { 'h': ['--help'], 'S': ['--save'], 'f': ['--force'], 'F': ['--force-latest'] };

module.exports = function (names, options) {
  options = options || {};

  var emitter = new Emitter;
  var manager = new Manager([], {
    force: options.force,
    forceLatest: options['force-latest']
  });

  manager.on('data',  emitter.emit.bind(emitter, 'data'));
  manager.on('error', emitter.emit.bind(emitter, 'error'));

  var install = function (err, array) {
    var mappings = {},
        endpoints = [],
        name,
        info,
        length,
        x;

    length = names.length;
    if (length) {
      for (x = 0; x < length; x += 1) {
        name = names[x];
        info = _.find(array, function (info) { return info.name === name; });
        if (!info) {
          return emitter.emit('error', new Error('Package ' + name + ' is not installed'));
        }

        endpoints.push(info.endpoint);
        mappings[info.endpoint] = info.name;
      }
    } else {
      array.forEach(function (info) {
        endpoints.push(info.endpoint);
        mappings[info.endpoint] = info.name;
      });
    }

    options.endpointNames = mappings;

    // By default the manager will guess the name of the package from the url
    // But this leads to problems when the package name does not match the one in the url
    // So the manager now has an option (endpointNames) to deal with this
    manager = new Manager(endpoints, options);
    manager
     .on('data',  emitter.emit.bind(emitter, 'data'))
     .on('warn',  emitter.emit.bind(emitter, 'warn'))
     .on('error', emitter.emit.bind(emitter, 'error'))
     .on('resolve', function (resolved) {
        // Handle save
        if (resolved && options.save) save(manager, null, false, emitter.emit.bind(emitter, 'end'));
        else emitter.emit('end');
      })
     .resolve();
  };

  manager.once('resolveLocal', function () {
    async.map(_.values(manager.dependencies), function (pkgs, next) {
      var pkg = pkgs[0];
      pkg.once('loadJSON', function () {
        var endpointInfo = pkg.readEndpoint();
        if (!endpointInfo) return next();

        // Add tag only if the endpoint is a repository
        var endpoint = endpointInfo.endpoint;
        var json  = pkg.json;
        if (!json.commit && (endpointInfo.type === 'git' || endpointInfo.type === 'local-repo')) {
          endpoint += '#' + ((!names || names.indexOf(pkg.name) > -1)  ? '~' : '') + pkg.version;
        }

        next(null, { name: pkg.name, endpoint: endpoint });
      }).loadJSON();
    }, install);
  }).resolveLocal();

  return emitter;
};

module.exports.line = function (argv) {
  var options = nopt(optionTypes, shorthand, argv);
  if (options.help) return help('update');

  var paths = options.argv.remain.slice(1);
  return module.exports(paths, options);
};

module.exports.completion = uninstall.completion;
module.exports.completion.options = shorthand;
