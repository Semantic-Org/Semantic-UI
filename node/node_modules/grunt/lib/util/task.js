/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

(function(exports) {

  // Construct-o-rama.
  function Task() {
    // Information about the currently-running task.
    this.current = {};
    // Helpers.
    this._helpers = {};
    // Tasks.
    this._tasks = {};
    // Task queue.
    this._queue = [];
    // Queue placeholder (for dealing with nested tasks).
    this._placeholder = {placeholder: true};
    // Queue marker (for clearing the queue programatically).
    this._marker = {marker: true};
    // Options.
    this._options = {};
    // Is the queue running?
    this._running = false;
    // Success status of completed tasks.
    this._success = {};
  }

  // Expose the constructor function.
  exports.Task = Task;

  // Create a new Task instance.
  exports.create = function() {
    return new Task();
  };

  // Error constructors.
  function TaskError(message) {
    Error.captureStackTrace(this, TaskError);
    this.message = message;
  }
  TaskError.prototype = Object.create(Error.prototype);
  TaskError.prototype.name = 'TaskError';

  function HelperError(message) {
    Error.captureStackTrace(this, HelperError);
    this.message = message;
  }
  HelperError.prototype = Object.create(Error.prototype);
  HelperError.prototype.name = 'HelperError';

  // Expose the ability to create a new taskError.
  Task.prototype.taskError = function(message, e) {
    var error = new TaskError(message);
    error.origError = e;
    return error;
  };

  // Register a new helper.
  Task.prototype.registerHelper = function(name, fn) {
    // Add task into cache.
    this._helpers[name] = fn;
    // Make chainable!
    return this;
  };

  // Rename a helper. This might be useful if you want to override the default
  // behavior of a helper, while retaining the old name (to avoid having to
  // completely recreate an already-made task just because you needed to
  // override or extend a built-in helper).
  Task.prototype.renameHelper = function(oldname, newname) {
    // Rename helper.
    this._helpers[newname] = this._helpers[oldname];
    // Remove old name.
    delete this._helpers[oldname];
    // Make chainable!
    return this;
  };

  // If the task runner is running or an error handler is not defined, throw
  // an exception. Otherwise, call the error handler directly.
  Task.prototype._throwIfRunning = function(obj) {
    if (this._running || !this._options.error) {
      // Throw an exception that the task runner will catch.
      throw obj;
    } else {
      // Not inside the task runner. Call the error handler and abort.
      this._options.error.call({name: null}, obj);
    }
  };

  // Execute a helper.
  Task.prototype.helper = function(isDirective, name) {
    var args = [].slice.call(arguments, 1);
    if (isDirective !== true) {
      name = isDirective;
      isDirective = false;
    } else {
      args = args.slice(1);
    }
    var helper = this._helpers[name];
    if (!helper) {
      // Helper not found.
      this._throwIfRunning(new HelperError('Helper "' + name + '" not found.'));
      return;
    }
    // Provide a few useful values on this.
    var context = {args: args, flags: {}};
    // Maybe you want to use flags instead of positional args?
    args.forEach(function(arg) { context.flags[arg] = true; });
    // Let the user know if it was used as a directive.
    if (isDirective) { context.directive = true; }
    // Invoke helper with any remaining arguments and return its value.
    return helper.apply(context, args);
  };

  // If a <foo:bar:baz> directive is passed, return ["foo", "bar", "baz"],
  // otherwise null.
  var directiveRe = /^<(.*)>$/;
  Task.prototype.getDirectiveParts = function(str) {
    var matches = str.match(directiveRe);
    // If the string doesn't look like a directive, return null.
    if (!matches) { return null; }
    // Split the name into parts.
    var parts = matches[1].split(':');
    // If a matching helper was found, return the parts, otherwise null.
    return this._helpers[parts[0]] ? parts : null;
  };

  // If value matches the <handler:arg1:arg2> format, and the specified handler
  // exists, it's a directive. Execute the matching handler and return its
  // value. If not, but an optional callback was passed, pass the value into
  // the callback and return its result. If no callback was specified, return
  // the value.
  Task.prototype.directive = function(value, fn) {
    // Get parts if a string was passed and it looks like a directive.
    var directive = typeof value === 'string' ? this.getDirectiveParts(value) : null;

    if (directive) {
      // If it looks like a directive and a matching helper exists, call the
      // helper by applying all directive parts and return its value.
      return this.helper.apply(this, [true].concat(directive));
    } else if (fn) {
      // Not a directive, but a callback was passed. Pass the value into the
      // callback and return its result.
      return fn(value);
    }
    // A callback wasn't specified or a valid handler wasn't found, so just
    // return the value.
    return value;
  };

  // Register a new task.
  Task.prototype.registerTask = function(name, info, fn) {
    // If optional "info" string is omitted, shuffle arguments a bit.
    if (fn == null) {
      fn = info;
      info = '';
    }
    // String or array of strings was passed instead of fn.
    var tasks;
    if (typeof fn !== 'function') {
      // Array of task names.
      tasks = this.parseArgs([fn]);
      // This task function just runs the specified tasks.
      fn = this.run.bind(this, fn);
      fn.alias = true;
      // Generate an info string if one wasn't explicitly passed.
      if (!info) {
        info = 'Alias for "' + tasks.join(' ') + '" task' +
          (tasks.length === 1 ? '' : 's') + '.';
      }
    }
    // Add task into cache.
    this._tasks[name] = {name: name, info: info, fn: fn};
    // Make chainable!
    return this;
  };

  // Is the specified task an alias?
  Task.prototype.isTaskAlias = function(name) {
    return !!this._tasks[name].fn.alias;
  };

  // Rename a task. This might be useful if you want to override the default
  // behavior of a task, while retaining the old name. This is a billion times
  // easier to implement than some kind of in-task "super" functionality.
  Task.prototype.renameTask = function(oldname, newname) {
    // Rename helper.
    this._tasks[newname] = this._tasks[oldname];
    // Update name property of task.
    this._tasks[newname].name = newname;
    // Remove old name.
    delete this._tasks[oldname];
    // Make chainable!
    return this;
  };

  // Argument parsing helper. Supports these signatures:
  //  fn('foo')                 // ['foo']
  //  fn('foo bar baz')         // ['foo', 'bar', 'baz']
  //  fn('foo', 'bar', 'baz')   // ['foo', 'bar', 'baz']
  //  fn(['foo', 'bar', 'baz']) // ['foo', 'bar', 'baz']
  Task.prototype.parseArgs = function(_arguments) {
    // If there are multiple (or zero) arguments, convert the _arguments object
    // into an array and return that.
    return _arguments.length !== 1 ? [].slice.call(_arguments) :
      // Return the first argument if it's an Array.
      Array.isArray(_arguments[0]) ? _arguments[0] :
      // Split the first argument on space.
      typeof _arguments[0] === 'string' ? _arguments[0].split(/\s+/) :
      // Just return an array containing the first argument. (todo: deprecate)
      [_arguments[0]];
  };

  // Given a task name, determine which actual task will be called, and what
  // arguments will be passed into the task callback. "foo" -> task "foo", no
  // args. "foo:bar:baz" -> task "foo:bar:baz" with no args (if "foo:bar:baz"
  // task exists), otherwise task "foo:bar" with arg "baz" (if "foo:bar" task
  // exists), otherwise task "foo" with args "bar" and "baz".
  Task.prototype._taskPlusArgs = function(name) {
    // Task name / argument parts.
    var parts = name.split(':');
    // Start from the end, not the beginning!
    var i = parts.length;
    var task;
    do {
      // Get a task.
      task = this._tasks[parts.slice(0, i).join(':')];
      // If the task doesn't exist, decrement `i`, and if `i` is greater than
      // 0, repeat.
    } while (!task && --i > 0);
    // Just the args.
    var args = parts.slice(i);
    // Maybe you want to use them as flags instead of as positional args?
    var flags = {};
    args.forEach(function(arg) { flags[arg] = true; });
    // The task to run and the args to run it with.
    return {task: task, nameArgs: name, args: args, flags: flags};
  };

  // Append things to queue in the correct spot.
  Task.prototype._push = function(things) {
    // Get current placeholder index.
    var index = this._queue.indexOf(this._placeholder);
    if (index === -1) {
      // No placeholder, add task+args objects to end of queue.
      this._queue = this._queue.concat(things);
    } else {
      // Placeholder exists, add task+args objects just before placeholder.
      [].splice.apply(this._queue, [index, 0].concat(things));
    }
  };

  // Enqueue a task.
  Task.prototype.run = function() {
    // Parse arguments into an array, returning an array of task+args objects.
    var things = this.parseArgs(arguments).map(this._taskPlusArgs, this);
    // Throw an exception if any tasks weren't found.
    var fails = things.filter(function(thing) { return !thing.task; });
    if (fails.length > 0) {
      this._throwIfRunning(new TaskError('Task "' + fails[0].nameArgs + '" not found.'));
      return this;
    }
    // Append things to queue in the correct spot.
    this._push(things);
    // Make chainable!
    return this;
  };

  // Add a marker to the queue to facilitate clearing it programatically.
  Task.prototype.mark = function() {
    this._push(this._marker);
    // Make chainable!
    return this;
  };

  // Begin task queue processing. Ie. run all tasks.
  Task.prototype.start = function() {
    // Abort if already running.
    if (this._running) { return false; }
    // Actually process the next task.
    var nextTask = function() {
      // Async flag.
      var async = false;
      // Get next task+args object from queue.
      var thing;
      // Skip any placeholders or markers.
      do {
        thing = this._queue.shift();
      } while (thing === this._placeholder || thing === this._marker);
      // If queue was empty, we're all done.
      if (!thing) {
        this._running = false;
        if (this._options.done) {
          this._options.done();
        }
        return;
      }
      // Add a placeholder to the front of the queue.
      this._queue.unshift(this._placeholder);
      // Update the internal status object and run the next task.
      var complete = function(status, errorObj) {
        this.current = {};
        // A task has "failed" only if it returns false (async) or if the
        // function returned by .async is passed false.
        this._success[thing.nameArgs] = status !== false;
        // If task failed, call error handler.
        if (status === false && this._options.error) {
          this._options.error.call({name: thing.task.name, nameArgs: thing.nameArgs}, errorObj ||
            new TaskError('Task "' + thing.nameArgs + '" failed.'));
        }
        // Run the next task.
        nextTask();
      }.bind(this);

      // Expose some information about the currently-running task.
      this.current = {
        // The current task name plus args, as-passed.
        nameArgs: thing.nameArgs,
        // The current task name.
        name: thing.task.name,
        // The current task arguments.
        args: thing.args,
        // The current arguments, available as named flags.
        flags: thing.flags,
        // When called, sets the async flag and returns a function that can
        // be used to continue processing the queue.
        async: function() {
          async = true;
          return complete;
        }
      };

      try {
        // Get the current task and run it, setting `this` inside the task
        // function to be something useful.
        var status = thing.task.fn.apply(this.current, thing.args);
        // If the async flag wasn't set, process the next task in the queue.
        if (!async) {
          complete(status);
        }
      } catch (e) {
        if (e instanceof TaskError || e instanceof HelperError) {
          complete(false, e);
        } else {
          throw e;
        }
      }
    }.bind(this);
    // Update flag.
    this._running = true;
    // Process the next task.
    nextTask();
  };

  // Clear remaining tasks from the queue.
  Task.prototype.clearQueue = function(options) {
    if (!options) { options = {}; }
    if (options.untilMarker) {
      this._queue.splice(0, this._queue.indexOf(this._marker) + 1);
    } else {
      this._queue = [];
    }
    // Make chainable!
    return this;
  };

  // Test to see if all of the given tasks have succeeded.
  Task.prototype.requires = function() {
    this.parseArgs(arguments).forEach(function(name) {
      var success = this._success[name];
      if (!success) {
        throw new TaskError('Required task "' + name +
          '" ' + (success === false ? 'failed' : 'missing') + '.');
      }
    }.bind(this));
  };

  // Override default options.
  Task.prototype.options = function(options) {
    Object.keys(options).forEach(function(name) {
      this._options[name] = options[name];
    }.bind(this));
  };

}(typeof exports === 'object' && exports || this));
