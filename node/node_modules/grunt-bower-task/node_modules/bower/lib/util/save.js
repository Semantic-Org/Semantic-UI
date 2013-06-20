// ==========================================
// BOWER: save
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var path   = require('path');
var fs     = require('fs');
var semver = require('semver');

var _      = require('lodash');

var config = require('../core/config');

function save(manager, paths, dev, cb) {
  // If there is specific paths to save, redirect to the appropriate function
  if (paths && paths.length) return savePkgs.apply(savePkgs, arguments);

  manager.on('loadJSON', function (newLine) {
    manager.json.dependencies = manager.json.dependencies || {};
    manager.json.devDependencies = manager.json.devDependencies || {};

    // Only include the root packages
    for (var name in manager.dependencies) {
      var curr = manager.dependencies[name][0];
      if (curr.root) {
        addDependency(manager.json, curr, !!manager.json.devDependencies[name]);
      }
    }

    // Cleanup dependencies from the json if empty
    if (!Object.keys(manager.json.dependencies).length) {
      delete manager.json.dependencies;
    }

    // Cleanup dependencies if empty
    if (!Object.keys(manager.json.devDependencies).length) {
      delete manager.json.devDependencies;
    }

    // Finally save the modified json
    var contents = JSON.stringify(manager.json, null, 2) + (newLine ? '\n' : '');
    fs.writeFile(path.join(manager.cwd, config.json), contents, cb);
  }).loadJSON();
}

function savePkgs(manager, paths, dev, cb) {
  manager.on('loadJSON', function (newLine) {
    // Find the package names that match the paths
    var names = _.compact(paths.map(function (endpoint) {
      endpoint = endpoint.split('#')[0];

      return _.find(Object.keys(manager.dependencies), function (key) {
        var dep = manager.dependencies[key][0];

        if (dep.name === endpoint) return true;
        if (dep.cacheName === endpoint) return true;
        if (dep.shorthand === endpoint) return true;

        var fetchedEndpoint = dep.readEndpoint();
        return fetchedEndpoint && fetchedEndpoint.endpoint === endpoint;
      });
    }));

    var key = dev ? 'devDependencies' : 'dependencies';
    manager.json[key] = manager.json[key] || {};

    // Save each of them
    // Only include the root packages
    names.forEach(function (name) {
      addDependency(manager.json, manager.dependencies[name][0], dev);
    });

    // Finally save the modified json
    var contents = JSON.stringify(manager.json, null, 2) + (newLine ? '\n' : '');
    fs.writeFile(path.join(manager.cwd, config.json), contents, cb);
  }).loadJSON();
}

function addDependency(json, pkg, dev) {
  var path;
  var tag;
  var key = dev ? 'devDependencies' : 'dependencies';

  if (pkg.lookedUp) {
    tag = pkg.originalTag || '~' + pkg.version;
  } else {
    path = (pkg.shorthand || pkg.gitUrl || pkg.originalAssetUrl || pkg.originalPath || '');
    tag = pkg.originalTag || '~' + pkg.version;
  }

  // If the tag is not valid (e.g.: a commit), null it
  if (!semver.valid(tag) && !semver.validRange(tag)) tag = null;

  json[key][pkg.name] = path ? path + (tag ? '#' + tag : '') : tag || 'latest';
}

module.exports = save;
