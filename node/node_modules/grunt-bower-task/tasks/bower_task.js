/*
 * grunt-bower-task
 * https://github.com/yatskevich/grunt-bower-task
 *
 * Copyright (c) 2012 Ivan Yatskevich
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var bower = require('bower'),
    path = require('path'),
    async = require('async'),
    colors = require('colors'),
    rimraf = require('rimraf').sync,
    BowerAssets = require('./lib/bower_assets'),
    AssetCopier = require('./lib/asset_copier'),
    LayoutsManager = require('./lib/layouts_manager');

  function log(message) {
    log.logger.writeln(message);
  }

  function fail(error) {
    grunt.fail.fatal(error);
  }

  function clean(dir, callback) {
    rimraf(dir);
    callback();
  }

  function install(callback) {
    bower.commands.install()
      .on('data', log)
      .on('error', fail)
      .on('end', callback);
  }

  function copy(options, callback) {
    var bowerAssets = new BowerAssets(bower, options.cwd);
    bowerAssets.once('data', function(assets) {
      var copier = new AssetCopier(assets, options, function(source, destination, isFile) {
        log('grunt-bower ' + 'copying '.cyan + ((isFile ? '' : ' dir ') + source + ' -> ' + destination).grey);
      });

      copier.once('copied', callback);
      copier.copy();
    }).get();
  }

  grunt.registerMultiTask('bower', 'Install Bower packages.', function() {
    var tasks = [],
      done = this.async(),
      options = this.options({
        cleanTargetDir: false,
        cleanBowerDir: false,
        targetDir: './lib',
        layout: 'byType',
        install: true,
        verbose: false,
        copy: true
      }),
      add = function(name, fn) {
        tasks.push(function(callback) {
          fn(function() {
            grunt.log.ok(name);
            callback();
          });
        });
      },
      bowerDir = path.resolve(bower.config.directory),
      targetDir = path.resolve(options.targetDir);

    log.logger = options.verbose ? grunt.log : grunt.verbose;
    options.layout = LayoutsManager.getLayout(options.layout, fail);
    options.cwd = grunt.option('base') || process.cwd();

    if (options.cleanup !== undefined) {
      options.cleanTargetDir = options.cleanBowerDir = options.cleanup;
    }

    if (options.cleanTargetDir) {
      add('Cleaned target dir ' + targetDir.grey, function(callback) {
        clean(targetDir, callback);
      });
    }

    if (options.install) {
      add('Installed bower packages', install);
    }

    if (options.copy) {
      add('Copied packages to ' + targetDir.grey, function(callback) {
        copy(options, callback);
      });
    }

    if (options.cleanBowerDir) {
      add('Cleaned bower dir ' + bowerDir.grey, function(callback) {
        clean(bowerDir, callback);
      });
    }

    async.series(tasks, done);
  });
};
