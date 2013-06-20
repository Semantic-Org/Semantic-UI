// ==========================================
// BOWER: git-cmd
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

// Extension of the spawn command, that only executes git commands
// If a git command fails with code 128 in the cache, that directory
// will be deleted to prevent more issues

var path   = require('path');
var spawn  = require('./spawn');
var rimraf = require('rimraf');
var config = require('../core/config');

module.exports = function (args, options, emitter) {
  process.env.GIT_TEMPLATE_DIR = config.git_template;
  var cp = spawn('git', args, options, emitter);
  var cwd = options ? options.cwd || process.cwd() : process.cwd();
  var isTmp = path.normalize(cwd).indexOf(config.cache) === 0;

  cp.on('exit', function (code) {
    if (code === 128 && isTmp) rimraf.sync(cwd);
  });

  return cp;
};
