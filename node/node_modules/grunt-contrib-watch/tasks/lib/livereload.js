/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var tinylr = require('tiny-lr');

// Holds the servers out of scope in case watch is reloaded
var servers = Object.create(null);

module.exports = function(grunt) {

  var defaults = { port: 35729 };

  function LR(options) {
    if (options === true) {
      options = defaults;
    } else if (typeof options === 'number') {
      options = {port: options};
    } else {
      options = grunt.util._.defaults(options, defaults);
    }
    if (servers[options.port]) {
      this.server = servers[options.port];
    } else {
      this.server = tinylr();
      this.server.server.removeAllListeners('error');
      this.server.server.on('error', function(err) {
        if (err.code === 'EADDRINUSE') {
          grunt.fatal('Port ' + options.port + ' is already in use by another process.');
        } else {
          grunt.fatal(err);
        }
        process.exit(1);
      });
      this.server.listen(options.port, function(err) {
        if (err) { return grunt.fatal(err); }
        grunt.log.verbose.writeln('Live reload server started on port: ' + options.port);
      });
      servers[options.port] = this.server;
    }
  }

  LR.prototype.trigger = function(files) {
    grunt.log.verbose.writeln('Live reloading ' + grunt.log.wordlist(files) + '...');
    this.server.changed({body:{files:files}});
  };

  return function(options) {
    return new LR(options);
  };
};
