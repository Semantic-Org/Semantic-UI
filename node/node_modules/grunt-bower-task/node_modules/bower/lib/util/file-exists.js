// ==========================================
// BOWER: file-exists
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var fs = require('fs');

// This module exposes a version of fs.exists and fs.existsSync with a correct behaviour
// See: https://github.com/joyent/node/pull/2603

module.exports = function (path, callback) {
  fs.stat(path, function (error) {
    callback(!error || error.code !== 'ENOENT');
  });
};

module.exports.sync = function (path) {
  try {
    return !!fs.statSync(path);
  } catch (e) {
    return e.code !== 'ENOENT';
  }
};