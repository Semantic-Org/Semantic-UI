/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

var grunt = require('../grunt');

// Nodejs libs.
var path = require('path');
var fs = require('fs');
// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

// Extend generic "task" utils lib.
var parent = grunt.utils.task.create();

// The module to be exported.
var task = module.exports = Object.create(parent);

// An internal registry of tasks and handlers.
var registry = {};

// Keep track of the number of log.error() calls.
var errorcount;

// Override built-in registerTask.
task.registerTask = function(name, info, fn) {
  // Add task to registry.
  registry.tasks.push(name);
  // Register task.
  parent.registerTask.apply(task, arguments);
  // This task, now that it's been registered.
  var thisTask = task._tasks[name];
  // Override task function.
  var _fn = thisTask.fn;
  thisTask.fn = function(arg) {
    // Initialize the errorcount for this task.
    errorcount = grunt.fail.errorcount;
    // Return the number of errors logged during this task.
    this.__defineGetter__('errorCount', function() {
      return grunt.fail.errorcount - errorcount;
    });
    // Expose task.requires on `this`.
    this.requires = task.requires.bind(task);
    // Expose config.requires on `this`.
    this.requiresConfig = grunt.config.requires;
    // If this task was an alias or a multi task called without a target,
    // only log if in verbose mode.
    var logger = _fn.alias || (thisTask.multi && (!arg || arg === '*')) ? 'verbose' : 'log';
    // Actually log.
    grunt[logger].header('Running "' + this.nameArgs + '"' +
      (this.name !== this.nameArgs ? ' (' + this.name + ')' : '') + ' task');
    // Actually run the task.
    return _fn.apply(this, arguments);
  };
  return task;
};

// This is the most common "multi task" pattern.
task.registerMultiTask = function(name, info, fn) {
  // Store a reference to the task object, in case the task gets renamed.
  var thisTask;
  task.registerTask(name, info, function(target) {
    // Guaranteed to always be the actual task name.
    var name = thisTask.name;
    // If a target wasn't specified, run this task once for each target.
    if (!target || target === '*') {
      return task.runAllTargets(name, grunt.utils.toArray(arguments).slice(1));
    }
    // Fail if any required config properties have been omitted.
    this.requiresConfig([name, target]);
    // Expose data on `this` (as well as task.current).
    this.data = grunt.config([name, target]);
    // Expose file object on `this` (as well as task.current).
    this.file = {};
    // Handle data structured like either:
    //   'prop': [srcfiles]
    //   {prop: {src: [srcfiles], dest: 'destfile'}}.
    if (grunt.utils.kindOf(this.data) === 'object') {
      if ('src' in this.data) { this.file.src = this.data.src; }
      if ('dest' in this.data) { this.file.dest = this.data.dest; }
    } else {
      this.file.src = this.data;
      this.file.dest = target;
    }
    // Process src as a template (recursively, if necessary).
    if (this.file.src) {
      this.file.src = grunt.utils.recurse(this.file.src, function(src) {
        if (typeof src !== 'string') { return src; }
        return grunt.template.process(src);
      });
    }
    // Process dest as a template.
    if (this.file.dest) {
      this.file.dest = grunt.template.process(this.file.dest);
    }
    // Expose the current target.
    this.target = target;
    // Remove target from args.
    this.args = grunt.utils.toArray(arguments).slice(1);
    // Recreate flags object so that the target isn't set as a flag.
    this.flags = {};
    this.args.forEach(function(arg) { this.flags[arg] = true; }, this);
    // Call original task function, passing in the target and any other args.
    return fn.apply(this, this.args);
  });
  thisTask = task._tasks[name];
  thisTask.multi = true;
};

// Init tasks don't require properties in config, and as such will preempt
// config loading errors.
task.registerInitTask = function(name, info, fn) {
  task.registerTask(name, info, fn);
  task._tasks[name].init = true;
};

// Override built-in registerHelper to use the registry.
task.registerHelper = function(name, fn) {
  // Add task to registry.
  registry.helpers.push(name);
  // Actually register task.
  return parent.registerHelper.apply(task, arguments);
};

// If a property wasn't passed, run all task targets in turn.
task.runAllTargets = function(taskname, args) {
  // Get an array of sub-property keys under the given config object.
  var targets = Object.keys(grunt.config(taskname) || {});
  // Fail if there are no actual properties to iterate over.
  if (targets.length === 0) {
    grunt.log.error('No "' + taskname + '" targets found.');
    return false;
  }
  // Iterate over all properties not starting with _, running a task for each.
  targets.filter(function(target) {
    return !/^_/.test(target);
  }).forEach(function(target) {
    // Be sure to pass in any additionally specified args.
    task.run([taskname, target].concat(args || []).join(':'));
  });
};

// Load tasks and handlers from a given tasks file.
var loadTaskStack = [];
function loadTask(filepath) {
  // In case this was called recursively, save registry for later.
  loadTaskStack.push({tasks: registry.tasks, helpers: registry.helpers});
  // Reset registry.
  registry.tasks = [];
  registry.helpers = [];
  var filename = path.basename(filepath);
  var msg = 'Loading "' + filename + '" tasks and helpers...';
  var fn;
  try {
    // Load taskfile.
    fn = require(path.resolve(filepath));
    if (typeof fn === 'function') {
      fn.call(grunt, grunt);
    }
    grunt.verbose.write(msg).ok();
    if (registry.tasks.length === 0 && registry.helpers.length === 0) {
      grunt.verbose.error('No new tasks or helpers found.');
    } else {
      if (registry.tasks.length > 0) {
        grunt.verbose.writeln('Tasks: ' + grunt.log.wordlist(registry.tasks));
      }
      if (registry.helpers.length > 0) {
        grunt.verbose.writeln('Helpers: ' + grunt.log.wordlist(registry.helpers));
      }
    }
  } catch(e) {
    // Something went wrong.
    grunt.log.write(msg).error().verbose.error(e.stack).or.error(e);
  }
  // Restore registry.
  var obj = loadTaskStack.pop() || {};
  registry.tasks = obj.tasks || [];
  registry.helpers = obj.helpers || [];
}

// Log a message when loading tasks.
function loadTasksMessage(info) {
  grunt.verbose.subhead('Registering ' + info + ' tasks.');
}

// Load tasks and handlers from a given directory.
function loadTasks(tasksdir) {
  try {
    fs.readdirSync(tasksdir).filter(function(filename) {
      // Filter out non-.js files.
      return path.extname(filename).toLowerCase() === '.js';
    }).forEach(function(filename) {
      // Load task.
      loadTask(path.join(tasksdir, filename));
    });
  } catch(e) {
    grunt.log.verbose.error(e.stack).or.error(e);
  }
}

// Directories to be searched for tasks files and "extra" files.
task.searchDirs = [];

// Return an array of all task-specific file paths that match the given
// wildcard patterns. Instead of returing a string for each file path, return
// an object with useful properties. When coerced to String, each object will
// yield its absolute path.
function expandByMethod(method) {
  var args = grunt.utils.toArray(arguments).slice(1);
  // If the first argument is an options object, remove and save it for later.
  var options = grunt.utils.kindOf(args[0]) === 'object' ? args.shift() : {};
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(args[0]) ? args[0] : args;
  var filepaths = {};
  // When any returned array item is used in a string context, return the
  // absolute path.
  var toString = function() { return this.abs; };
  // Iterate over all searchDirs.
  task.searchDirs.forEach(function(dirpath) {
    // Create an array of absolute patterns.
    var args = patterns.map(function(pattern) {
      return path.join(dirpath, pattern);
    });
    // Add the options object back onto the beginning of the arguments array.
    args.unshift(options);
    // Expand the paths in case a wildcard was passed.
    grunt.file[method].apply(null, args).forEach(function(abspath) {
      var relpath = abspath.slice(dirpath.length + 1);
      if (relpath in filepaths) { return; }
      // Update object at this relpath only if it doesn't already exist.
      filepaths[relpath] = {
        abs: abspath,
        rel: relpath,
        base: abspath.slice(0, dirpath.length),
        toString: toString
      };
    });
  });
  // Return an array of objects.
  return Object.keys(filepaths).map(function(relpath) {
    return filepaths[relpath];
  });
}

// A few type-specific task expansion methods. These methods all return arrays
// of file objects.
task.expand = expandByMethod.bind(task, 'expand');
task.expandDirs = expandByMethod.bind(task, 'expandDirs');
task.expandFiles = expandByMethod.bind(task, 'expandFiles');

// Get a single task file path.
task.getFile = function() {
  var filepath = path.join.apply(path, arguments);
  var fileobj = task.expand(filepath)[0];
  return fileobj ? String(fileobj) : null;
};

// Read JSON defaults from task files (if they exist), merging them into one.
// data object.
var readDefaults = {};
task.readDefaults = function() {
  var filepath = path.join.apply(path, arguments);
  var result = readDefaults[filepath];
  var filepaths;
  if (!result) {
    result = readDefaults[filepath] = {};
    // Find all matching taskfiles.
    filepaths = task.searchDirs.map(function(dirpath) {
      return path.join(dirpath, filepath);
    }).filter(function(filepath) {
      return existsSync(filepath) && fs.statSync(filepath).isFile();
    });
    // Load defaults data.
    if (filepaths.length) {
      grunt.verbose.subhead('Loading data from ' + filepath);
      // Since extras path order goes from most-specific to least-specific, only
      // add-in properties that don't already exist.
      filepaths.forEach(function(filepath) {
        grunt.utils._.defaults(result, grunt.file.readJSON(filepath));
      });
    }
  }
  return result;
};

// Load tasks and handlers from a given directory.
task.loadTasks = function(tasksdir) {
  loadTasksMessage('"' + tasksdir + '"');
  if (existsSync(tasksdir)) {
    task.searchDirs.unshift(tasksdir);
    loadTasks(tasksdir);
  } else {
    grunt.log.error('Tasks directory "' + tasksdir + '" not found.');
  }
};

// Load tasks and handlers from a given locally-installed Npm module (installed
// relative to the base dir).
task.loadNpmTasks = function(name) {
  loadTasksMessage('"' + name + '" local Npm module');
  var root = path.resolve('node_modules');
  var pkgfile = path.join(root, name, 'package.json');
  var pkg = existsSync(pkgfile) ? grunt.file.readJSON(pkgfile) : {};

  // Process collection plugins.
  if (pkg.keywords && pkg.keywords.indexOf('gruntcollection') !== -1) {
    Object.keys(pkg.dependencies).forEach(function(depName) {
      // Npm sometimes pulls dependencies out if they're shared, so find
      // upwards if not found locally.
      var filepath = grunt.file.findup(path.resolve('node_modules', name),
        'node_modules/' + depName);
      if (filepath) {
        // Load this task plugin recursively.
        task.loadNpmTasks(path.relative(root, filepath));
      }
    });
    return;
  }

  // Process task plugins.
  var tasksdir = path.join(root, name, 'tasks');
  if (existsSync(tasksdir)) {
    task.searchDirs.unshift(tasksdir);
    loadTasks(tasksdir);
  } else {
    grunt.log.error('Local Npm module "' + name + '" not found. Is it installed?');
  }
};

// Load tasks and handlers from a given Npm module, installed relative to the
// version of grunt being run.
function loadNpmTasksWithRequire(name) {
  loadTasksMessage('"' + name + '" npm module');
  var dirpath;
  try {
    dirpath = require.resolve(name);
    dirpath = path.resolve(path.join(path.dirname(dirpath), 'tasks'));
    if (existsSync(dirpath)) {
      task.searchDirs.unshift(dirpath);
      loadTasks(dirpath);
      return;
    }
  } catch (e) {}

  grunt.log.error('Npm module "' + name + '" not found. Is it installed?');
}

// Initialize tasks.
task.init = function(tasks, options) {
  if (!options) { options = {}; }

  // Load all built-in tasks.
  var tasksdir = path.resolve(__dirname, '../../tasks');
  task.searchDirs.unshift(tasksdir);
  loadTasksMessage('built-in');
  loadTasks(tasksdir);

  // Grunt was loaded from a Npm-installed plugin bin script. Load any tasks
  // that were specified via grunt.npmTasks.
  grunt._npmTasks.forEach(loadNpmTasksWithRequire);

  // Were only init tasks specified?
  var allInit = tasks.length > 0 && tasks.every(function(name) {
    var obj = task._taskPlusArgs(name).task;
    return obj && obj.init;
  });

  // Get any local configfile or tasks that might exist. Use --config override
  // if specified, otherwise search the current directory or any parent.
  var configfile = allInit ? null : grunt.option('config') ||
    grunt.file.findup(process.cwd(), 'grunt.js');

  var msg = 'Reading "' + path.basename(configfile) + '" config file...';
  if (configfile && existsSync(configfile)) {
    grunt.verbose.writeln().write(msg).ok();
    // Change working directory so that all paths are relative to the
    // configfile's location (or the --base option, if specified).
    process.chdir(grunt.option('base') || path.dirname(configfile));
    // Load local tasks, if the file exists.
    loadTask(configfile);
  } else if (options.help || allInit) {
    // Don't complain about missing config file.
  } else if (grunt.option('config')) {
    // If --config override was specified and it doesn't exist, complain.
    grunt.log.writeln().write(msg).error();
    grunt.fatal('Unable to find "' + configfile + '" config file.', 2);
  } else if (!grunt.option('help')) {
    grunt.verbose.writeln().write(msg).error();
    grunt.fatal('Unable to find "grunt.js" config file. Do you need any --help?', 2);
  }

  // Load all user-specified --npm tasks.
  (grunt.option('npm') || []).forEach(task.loadNpmTasks);
  // Load all user-specified --tasks.
  (grunt.option('tasks') || []).forEach(task.loadTasks);

  // Load user .grunt tasks.
  tasksdir = grunt.file.userDir('tasks');
  if (tasksdir) {
    task.searchDirs.unshift(tasksdir);
    loadTasksMessage('user');
    loadTasks(tasksdir);
  }

  // Search dirs should be unique and fully normalized absolute paths.
  task.searchDirs = grunt.utils._.uniq(task.searchDirs).map(function(filepath) {
    return path.resolve(filepath);
  });
};
