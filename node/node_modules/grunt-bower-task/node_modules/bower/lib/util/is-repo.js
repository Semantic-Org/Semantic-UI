// ==========================================
// BOWER: is-repo
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var fs         = require('fs');
var path       = require('path');
var fileExists = require('./file-exists');

// This module checks if a path is a local repository
// If the repository is a link, it will be falsy
module.exports = function (dir, callback) {
  fileExists(path.join(dir, '.git'), function (exists) {
    if (!exists) return callback(false);
    fs.lstat(dir, function (err, stat) {
      if (err) return callback(false);
      callback(!stat.isSymbolicLink());
    });
  });
};