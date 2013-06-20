/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  var path = require('path');
  var Gaze = require('gaze').Gaze;
  var taskrun = require('./lib/taskrunner')(grunt);

  var waiting = 'Waiting...';
  var changedFiles = Object.create(null);
  var watchers = [];

  // When task runner has started
  taskrun.on('start', function() {
    grunt.log.ok();
    Object.keys(changedFiles).forEach(function(filepath) {
      // Log which file has changed, and how.
      grunt.log.ok('File "' + filepath + '" ' + changedFiles[filepath] + '.');
    });
    grunt.log.writeln();
    // Reset changedFiles
    changedFiles = Object.create(null);
  });

  // When task runner has ended
  taskrun.on('end', function(time) {
    if (time > 0) {
      grunt.log.writeln(String(
        'Completed in ' +
        time.toFixed(3) +
        's at ' +
        (new Date()).toString()
      ).cyan + ' - ' + waiting);
    }
  });

  // When a task run has been interrupted
  taskrun.on('interrupt', function() {
    grunt.log.writeln('').write('Scheduled tasks have been interrupted...'.yellow);
  });

  // When taskrun is reloaded
  taskrun.on('reload', function() {
    taskrun.clearRequireCache(Object.keys(changedFiles));
    grunt.log.writeln('').writeln('Reloading watch config...'.cyan);
  });

  grunt.registerTask('watch', 'Run predefined tasks whenever watched files change.', function(target) {
    var self = this;
    var name = self.name || 'watch';

    // Close any previously opened watchers
    watchers.forEach(function(watcher, i) {
      watcher.close();
    });
    watchers = [];

    // Never gonna give you up, never gonna let you down
    if (grunt.config([name, 'options', 'forever']) !== false) {
      taskrun.forever();
    }

    if (taskrun.running === false) { grunt.log.write(waiting); }

    // initialize taskrun
    var targets = taskrun.init(name, {
      interrupt: false,
      nospawn: false,
      event: ['all'],
      target: target,
    });

    targets.forEach(function(target, i) {
      if (typeof target.files === 'string') { target.files = [target.files]; }

      // Process into raw patterns
      var patterns = grunt.util._.chain(target.files).flatten().map(function(pattern) {
        return grunt.config.process(pattern);
      }).value();

      // Validate the event option
      if (typeof target.options.event === 'string') {
        target.options.event = [target.options.event];
      }

      // Create watcher per target
      watchers.push(new Gaze(patterns, target.options, function(err) {
        if (err) {
          if (typeof err === 'string') { err = new Error(err); }
          grunt.log.writeln('ERROR'.red);
          grunt.fatal(err);
          return taskrun.done();
        }

        // Log all watched files with --verbose set
        if (grunt.option('verbose')) {
          var watched = this.watched();
          Object.keys(watched).forEach(function(watchedDir) {
            watched[watchedDir].forEach(function(watchedFile) {
              grunt.log.writeln('Watching ' + path.relative(process.cwd(), watchedFile) + ' for changes.');
            });
          });
        }

        // On changed/added/deleted
        this.on('all', function(status, filepath) {

          // Skip events not specified
          if (!grunt.util._.contains(target.options.event, 'all') &&
              !grunt.util._.contains(target.options.event, status)) {
            return;
          }

          filepath = path.relative(process.cwd(), filepath);

          // If Gruntfile.js changed, reload self task
          if (/gruntfile\.(js|coffee)/i.test(filepath)) {
            taskrun.reload = true;
          }

          // Emit watch events if anyone is listening
          if (grunt.event.listeners('watch').length > 0) {
            grunt.event.emit('watch', status, filepath);
          }

          // Group changed files only for display
          changedFiles[filepath] = status;

          // Add changed files to the target
          if (taskrun.targets[target.name]) {
            taskrun.targets[target.name].changedFiles = Object.create(null);
            taskrun.targets[target.name].changedFiles[filepath] = status;
          }

          // Queue the target
          if (taskrun.queue.indexOf(target.name) === -1) {
            taskrun.queue.push(target.name);
          }

          // Run the tasks
          taskrun.run();
        });

        // On watcher error
        this.on('error', function(err) {
          if (typeof err === 'string') { err = new Error(err); }
          grunt.log.error(err.message);
        });
      }));
    });

  });
};
