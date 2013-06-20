// ==========================================
// BOWER: spawn
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var spawn = require('child_process').spawn;

// This module is similar to child-process spawn
// but automatically handles errors
// When an error occurs, it emits the error event containing the details of the error
// It also removes all the listeners of the command

module.exports = function (command, args, options, emitter) {
  var cp = spawn(command, args, options);
  var stderr = '';

  cp.stderr.on('data', function (data) {
    stderr += data;
  });

  cp.on('exit', function (code) {
    if (code && (!options || !options.ignoreCodes || options.ignoreCodes.indexOf(code) === -1)) {
      cp.removeAllListeners();
      var err = new Error('status code of ' + command + ': ' + code);
      err.details = stderr;
      err.command = command;
      err.code = code;
      emitter.emit('error', err);
    }
  });

  return cp;
};
