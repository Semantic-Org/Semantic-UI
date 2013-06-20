/*
 * grunt-contrib-watch
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var EE = require('events').EventEmitter;
var util = require('util');

// Track which targets to run after reload
var reloadTargets = [];

module.exports = function(grunt) {

  var TaskRun = require('./taskrun')(grunt);
  var livereload = require('./livereload')(grunt);

  function Runner() {
    EE.call(this);
    // Name of the task
    this.name = 'watch';
    // Options for the runner
    this.options = {};
    // Function to close the task
    this.done = function() {};
    // Targets available to task run
    this.targets = Object.create(null);
    // The queue of task runs
    this.queue = [];
    // Whether we're actively running tasks
    this.running = false;
    // If a nospawn task has ran (and needs the watch to restart)
    this.nospawn = false;
    // Set to true before run() to reload task
    this.reload = false;
    // For re-queuing arguments with the task that originally ran this
    this.nameArgs = [];
    // A list of changed files to feed to task runs for livereload
    this.changedFiles = Object.create(null);
  }
  util.inherits(Runner, EE);

  // Init a task for taskrun
  Runner.prototype.init = function init(name, defaults, done) {
    var self = this;

    self.name = name || grunt.task.current.name || 'watch';
    self.options = grunt.task.current.options(defaults || {}, {
      // The cwd to spawn within
      cwd: process.cwd(),
      // Additional cli args to append when spawning
      cliArgs: grunt.util._.without.apply(null, [[].slice.call(process.argv, 2)].concat(grunt.cli.tasks)),
    });
    self.reload = false;
    self.nameArgs = (grunt.task.current.nameArgs) ? grunt.task.current.nameArgs : self.name;

    // Function to call when closing the task
    self.done = done || grunt.task.current.async();

    // If a default livereload server for all targets
    // Use task level unless target level overrides
    var taskLRConfig = grunt.config([self.name, 'options', 'livereload']);
    if (self.options.target && taskLRConfig) {
      var targetLRConfig = grunt.config([self.name, self.options.target, 'options', 'livereload']);
      if (targetLRConfig) {
        // Dont use task level as target level will be used instead
        taskLRConfig = false;
      }
    }
    if (taskLRConfig) {
      self.livereload = livereload(taskLRConfig);
    }

    if (self.running) {
      // If previously running, complete the last run
      self.complete();
    } else if (reloadTargets.length > 0) {
      // If not previously running but has items in the queue, needs run
      self.queue = reloadTargets;
      reloadTargets = [];
      self.run();
    }

    // Return the targets normalized
    return self._getTargets(self.name);
  };

  // Normalize targets from config
  Runner.prototype._getTargets = function _getTargets(name) {
    var self = this;

    grunt.task.current.requiresConfig(name);
    var config = grunt.config(name);
    var onlyTarget = (self.options.target) ? self.options.target : false;

    var targets = (onlyTarget ? [onlyTarget] : Object.keys(config)).filter(function(key) {
      if (key === 'options') { return false; }
      return typeof config[key] !== 'string' && !Array.isArray(config[key]);
    }).map(function(target) {
      // Fail if any required config properties have been omitted
      grunt.task.current.requiresConfig([name, target, 'files']);
      var cfg = grunt.config([name, target]);
      cfg.name = target;
      cfg.options = grunt.util._.defaults(cfg.options || {}, self.options);
      self.add(cfg);
      return cfg;
    }, self);

    // Allow "basic" non-target format
    if (typeof config.files === 'string' || Array.isArray(config.files)) {
      var cfg = {
        files: config.files,
        tasks: config.tasks,
        name: 'default',
        options: grunt.util._.defaults(config.options || {}, self.options),
      };
      targets.push(cfg);
      self.add(cfg);
    }

    return targets;
  };

  // Run the current queue of task runs
  Runner.prototype.run = grunt.util._.debounce(function run() {
    var self = this;
    if (self.queue.length < 1) {
      self.running = false;
      return;
    }

    // If we should interrupt
    if (self.running === true) {
      var shouldInterrupt = true;
      self.queue.forEach(function(name) {
        var tr = self.targets[name];
        if (tr && tr.options.interrupt !== true) {
          shouldInterrupt = false;
          return false;
        }
      });
      if (shouldInterrupt === true) {
        self.interrupt();
      } else {
        // Dont interrupt the tasks running
        return;
      }
    }

    // If we should reload
    if (self.reload) { return self.reloadTask(); }

    // Trigger that tasks runs have started
    self.emit('start');
    self.running = true;

    // Run each target
    var shouldComplete = true;
    grunt.util.async.forEachSeries(self.queue, function(name, next) {
      var tr = self.targets[name];
      if (!tr) { return next(); }
      if (tr.options.nospawn) { shouldComplete = false; }
      tr.run(next);
    }, function() {
      if (shouldComplete) {
        self.complete();
      } else {
        grunt.task.mark().run(self.nameArgs);
        self.done();
      }
    });
  }, 250);

  // Push targets onto the queue
  Runner.prototype.add = function add(target) {
    if (!this.targets[target.name || 0]) {
      var tr = new TaskRun(target, this.options);

      // Add livereload to task runs
      // Get directly from config as task level options are merged.
      // We only want a single default LR server and then
      // allow each target to override their own.
      var lrconfig = grunt.config([this.name, target.name || 0, 'options', 'livereload']);
      if (lrconfig) {
        tr.livereload = livereload(lrconfig);
      } else if (this.livereload && lrconfig !== false) {
        tr.livereload = this.livereload;
      }

      return this.targets[tr.name] = tr;
    }
    return false;
  };

  // Do this when queued task runs have completed/scheduled
  Runner.prototype.complete = function complete() {
    var self = this;
    if (self.running === false) { return; }
    self.running = false;
    var time = 0;
    self.queue.forEach(function(name, i) {
      var target = self.targets[name];
      if (!target) { return; }
      if (target.startedAt !== false) {
        time += target.complete();
        self.queue[i] = null;

        // if we're just livereloading and no tasks
        // it can happen too fast and we dont report it
        if (target.options.livereload && target.tasks.length < 1) {
          time += 0.0001;
        }
      }
    });
    var elapsed = (time > 0) ? Number(time / 1000) : 0;
    self.changedFiles = Object.create(null);
    self.emit('end', elapsed);
  };

  // Run through completing every target in the queue
  Runner.prototype._completeQueue = function _completeQueue() {
    var self = this;
    self.queue.forEach(function(name) {
      var target = self.targets[name];
      if (!target) { return; }
      target.complete();
    });
  };

  // Interrupt the running tasks
  Runner.prototype.interrupt = function interrupt() {
    var self = this;
    self._completeQueue();
    grunt.task.clearQueue();
    self.emit('interrupt');
  };

  // Attempt to make this task run forever
  Runner.prototype.forever = function forever() {
    var self = this;
    function rerun() {
      // Clear queue and rerun to prevent failing
      self._completeQueue();
      grunt.task.clearQueue();
      grunt.task.run(self.nameArgs);
      self.running = false;
    }
    grunt.warn = grunt.fail.warn = function(e) {
      var message = typeof e === 'string' ? e : e.message;
      grunt.log.writeln(('Warning: ' + message).yellow);
      if (!grunt.option('force')) {
        rerun();
      }
    };
    grunt.fatal = grunt.fail.fatal = function(e) {
      var message = typeof e === 'string' ? e : e.message;
      grunt.log.writeln(('Fatal error: ' + message).red);
      rerun();
    };
  };

  // Clear the require cache for all passed filepaths.
  Runner.prototype.clearRequireCache = function() {
    // If a non-string argument is passed, it's an array of filepaths, otherwise
    // each filepath is passed individually.
    var filepaths = typeof arguments[0] !== 'string' ? arguments[0] : grunt.util.toArray(arguments);
    // For each filepath, clear the require cache, if necessary.
    filepaths.forEach(function(filepath) {
      var abspath = path.resolve(filepath);
      if (require.cache[abspath]) {
        grunt.verbose.write('Clearing require cache for "' + filepath + '" file...').ok();
        delete require.cache[abspath];
      }
    });
  };

  // Reload this watch task, like when a Gruntfile is edited
  Runner.prototype.reloadTask = function() {
    var self = this;
    // Which targets to run after reload
    reloadTargets = self.queue;
    self.emit('reload', reloadTargets);

    // Re-init the watch task config
    grunt.task.init([self.name]);

    // Complete all running tasks
    self._completeQueue();

    // Run the watch task again
    grunt.task.run(self.nameArgs);
    self.done();
  };

  return new Runner();
};
