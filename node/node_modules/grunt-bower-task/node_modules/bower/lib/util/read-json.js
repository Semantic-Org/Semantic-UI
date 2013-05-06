// ==========================================
// BOWER: read-json.js - with logging fun
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var readJSON = require('read-package-json');
var template = require('./template');

var read = module.exports = function (path, cb, obj) {
  readJSON.log = {
    info: function () {},
    verbose: function () {},
    warn: function (what, name, shizzle) {
      if (read.showWarnings) {
        template('warn', { name: name.replace(/@/, '#'), shizzle: shizzle })
          .on('data', obj.emit.bind(obj, 'data'));
      }
    }
  };
  readJSON.cache.reset();
  readJSON(path, cb);
};