// ==========================================
// BOWER: fallback
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================
// A function that takes a list of files and returns the first one that exists
// If none exists, return null

var fileExists = require('./file-exists');
var path       = require('path');

var fallback = function (baseDir, files, callback) {
  if (!Array.isArray(files) || files.length === 0) {
    return callback(null);
  }

  var file = files.shift();

  fileExists(path.join(baseDir, file), function (exists) {
    if (!exists) {
      return fallback(baseDir, files, callback);
    } else {
      return callback(file);
    }
  });
};

module.exports = fallback;


