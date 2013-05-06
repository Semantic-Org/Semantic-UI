// ==========================================
// BOWER: Uninstall API
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var Emitter  = require('events').EventEmitter;
var async    = require('async');
var nopt     = require('nopt');
var fs       = require('fs');
var path     = require('path');
var _        = require('lodash');

var template = require('../util/template');
var Manager  = require('../core/manager');
var config   = require('../core/config');
var help     = require('./help');

var optionTypes = { help: Boolean, force: Boolean, save: Boolean };
var shorthand   = { 'h': ['--help'], 'S': ['--save'], 'D': ['--save-dev'], 'f': ['--force'] };

module.exports = function (names, options) {
  var packages, uninstallables, packagesCount = {};
  var emitter = new Emitter;
  var manager = new Manager;
  var jsonDeps;
  var newLine;

  options = options || {};

  manager.on('data',  emitter.emit.bind(emitter, 'data'));
  manager.on('error', emitter.emit.bind(emitter, 'error'));

  var resolveLocal = function () {
    jsonDeps = manager.json.dependencies || {};
    packages = _.flatten(_.values(manager.dependencies));
    uninstallables = packages.filter(function (pkg) {
      return _.include(names, pkg.name);
    });
    async.forEach(packages, function (pkg, next) {
      pkg.once('loadJSON', next).loadJSON();
    }, function () {
      if (showWarnings(options.force) && !options.force) return;
      expandUninstallabes(options.force);
      uninstall();
    });
  };

  var showWarnings = function (force) {
    var foundConflicts = false;

    packages.forEach(function (pkg) {
      if (!pkg.json.dependencies) return;
      if (containsPkg(uninstallables, pkg)) return;

      var conflicts = _.intersection(
        Object.keys(pkg.json.dependencies),
        _.pluck(uninstallables, 'name')
      );

      if (conflicts.length) {
        foundConflicts = true;
        if (!force) {
          conflicts.forEach(function (conflictName) {
            emitter.emit('data', template('warning-uninstall', { packageName: pkg.name, conflictName: conflictName }, true));
          });
        }
      }
    });

    if (foundConflicts && !force) {
      emitter.emit('data', template('warn', { message: 'To proceed, run uninstall with the --force flag'}, true));
    }

    return foundConflicts;
  };

  var expandUninstallabes = function (force) {
    var x,
        pkg,
        forcedUninstallables = {};

    // Direct JSON deps have a count of 1
    for (var key in jsonDeps) {
      packagesCount[key] = 1;
    }

    // Count all packages
    count(packages, packagesCount);

    if (force) {
      uninstallables.forEach(function (pkg) {
        forcedUninstallables[pkg.name] = true;
      });
    }

    // Expand the uninstallables deps and nested deps
    // Also update the count accordingly
    for (x = uninstallables.length - 1; x >= 0; x -= 1) {
      parseUninstallableDeps(uninstallables[x]);
    }

    // Foreach uninstallable, check if it is really to be removed by reading the final count
    // If the final count is greater than 0, then it is a shared dep
    // In that case, we remove it from the uninstallables unless it's forced to be uninstalled
    for (x = uninstallables.length - 1; x >= 0; x -= 1) {
      pkg = uninstallables[x];
      if (packagesCount[pkg.name] > 0 && !forcedUninstallables[pkg.name]) uninstallables.splice(x, 1);
    }
  };

  var count = function (packages, counts, nested) {
    packages.forEach(function (pkg) {
      counts[pkg.name] = (counts[pkg.name] || 0);
      if (nested) counts[pkg.name] += 1;

      if (pkg.json.dependencies) {
        for (var key in pkg.json.dependencies) {
          count(manager.dependencies[key], counts, true);
        }
      }
    });
  };

  var parseUninstallableDeps = function (pkg) {
    if (!containsPkg(uninstallables, pkg)) uninstallables.push(pkg);
    packagesCount[pkg.name] -= 1;

    if (pkg.json.dependencies) {
      for (var key in pkg.json.dependencies) {
        parseUninstallableDeps(manager.dependencies[key][0]);
      }
    }
  };

  var containsPkg = function (packages, pkg) {
    for (var x = packages.length - 1; x >= 0; x -= 1) {
      if (packages[x].name === pkg.name) return true;
    }

    return false;
  };

  var uninstall = function () {
    async.forEach(uninstallables, function (pkg, next) {
      pkg.on('uninstall', function () {
        emitter.emit('package', pkg);
        next();
      }).uninstall();
    }, function () {
      // Finally save
      if (options.save || options['save-dev']) save(!options.save);
      emitter.emit('end');
    });
  };

  var save = function (dev) {
    var key = dev ? 'devDependencies' : 'dependencies';
    var contents;

    if (manager.json[key]) {
      names.forEach(function (name) {
        delete manager.json[key][name];
      });

      contents = JSON.stringify(manager.json, null, 2) + (newLine ? '\n' : '');
      fs.writeFileSync(path.join(manager.cwd, config.json), contents);
    }
  };

  manager.on('loadJSON', function (hasNewLine) {
    newLine = hasNewLine;
    manager.on('resolveLocal', resolveLocal).resolveLocal();
  }).loadJSON();

  return emitter;
};

module.exports.line = function (argv) {
  var options = nopt(optionTypes, shorthand, argv);
  var names     = options.argv.remain.slice(1);

  if (options.help || !names.length) return help('uninstall');
  return module.exports(names, options);
};

module.exports.completion = function (opts, cb) {
  var word = opts.word;

  // completing options?
  if (opts.words[0] === 'uninstall' && word.charAt(0) === '-') {
    return cb(null, Object.keys(optionTypes).map(function (option) {
      return '--' + option;
    }));
  }

  fs.readdir(config.directory, function (err, dirs) {
    // ignore ENOENT, ./components not created yet
    if (err && err.code === 'ENOENT') return cb(null, []);
    cb(err, dirs);
  });
};

module.exports.completion.options = shorthand;
