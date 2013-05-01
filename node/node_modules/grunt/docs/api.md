[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# The grunt API

Grunt exposes all of its methods and properties on the `grunt` object that gets passed into the `module.exports` function exported in your [grunt.js gruntfile](getting_started.md) or in your [tasks file](types_of_tasks.md).

For example, your project's [grunt.js gruntfile](getting_started.md) might look like this:

```javascript
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
    },
    jshint: {
      options: {
        browser: true
      }
    }
  });

  // Load tasks from "grunt-sample" grunt plugin installed via Npm.
  grunt.loadNpmTasks('grunt-sample');

  // Default task.
  grunt.registerTask('default', 'lint sample');

};
```

And if you're creating a [grunt plugin](plugins.md) or just organizing tasks into a folder, a [custom tasks file](types_of_tasks.md) might look like this:

```javascript
module.exports = function(grunt) {

  // Create a new task.
  grunt.registerTask('awesome', 'Print out "awesome!!!"', function() {
    var awesome = grunt.helper('awesome');
    grunt.log.write(awesome);
  });

  // Register a helper.
  grunt.registerHelper('awesome', function() {
    return 'awesome!!!';
  });

};
```

But these are just examples. For more information, read on.

## A Very Important Note
Your `grunt.js` gruntfile or tasks file **must** contain this code, once and **only** once. If it doesn't, things won't work. For the sake of brevity, this "wrapper" code has been omitted from all future examples on this page, but it needs to be there. Like in the previous examples.

```javascript
module.exports = function(grunt) {
  // Your grunt code goes in here.
};
```

## Config
_Note that the method listed below is also available on the [grunt.config](api_config.md) object in addition to the `grunt` object._


### grunt.initConfig
Initialize a configuration object for the current project. The specified `configObject` is used by tasks and helpers and can also be accessed using the [grunt.config](api_config.md) method. Nearly every project's [grunt.js gruntfile](getting_started.md) will call this method.

Note that any specified `<config>` and `<json>` [directives](api_task.md) will be automatically processed when the config object is initialized.

```javascript
grunt.initConfig(configObject)
```

This example contains sample config data for the [lint task](task_lint.md):

```javascript
grunt.initConfig({
  lint: {
    all: ['lib/*.js', 'test/*.js', 'grunt.js']
  }
});
```

See the [configuring grunt](getting_started.md) page for more configuration examples.

_This method is an alias for the [grunt.config.init](api_config.md) method._


## Creating Tasks
Tasks are grunt's bread and butter. The stuff you do most often, like `lint` or `test`. Every time grunt is run, you specify one or more tasks to run, which tells grunt what you'd like it to do.

If you don't specify a task, but a task named "default" has been defined, that task will run (unsurprisingly) by default.

_Note that the methods listed below are also available on the [grunt.task](api_task.md) object in addition to the `grunt` object._


### grunt.registerTask
Register an "alias task" or a task function. This method supports the following two signatures:

**Alias task**

If a task list is specified, the new task will be an alias for one or more other tasks. Whenever this "alias task" is run, every specified task in `taskList` will be run, in the order specified. The `taskList` argument can be a space-separated string or an array of task names.

```javascript
grunt.registerTask(taskName, taskList)
```

This example alias task defines a "default" task whereby the "lint", "qunit", "concat" and "min" tasks are run automatically if grunt is executed without any tasks specified:

```javascript
task.registerTask('default', 'lint qunit concat min');
```

**Function task**

If a `description` and `taskFunction` are passed, the specified function will be executed whenever the task is run. In addition, the specified description will be shown when `grunt --help` is run. Task-specific properties and methods are available inside the task function as properties of the `this` object. The task function can return `false` to indicate that the task has failed.

Note that the `grunt.registerMultiTask` method, explained below, can be used to define a special type of task known as a "multi task."

```javascript
grunt.registerTask(taskName, description, taskFunction)
```

This example task logs `foo, testing 123` if grunt is run via `grunt foo:testing:123`. If the task is run without arguments as `grunt foo` the task logs `foo, no args`.

```javascript
grunt.registerTask('foo', 'A sample task that logs stuff.', function(arg1, arg2) {
  if (arguments.length === 0) {
    grunt.log.writeln(this.name + ", no args");
  } else {
    grunt.log.writeln(this.name + ", " + arg1 + " " + arg2);
  }
});
```

See the [creating tasks](types_of_tasks.md) documentation for more examples of tasks and alias tasks.

_This method is an alias for the [grunt.task.registerTask](api_task.md) method._


### grunt.registerMultiTask
Register a "multi task." A multi task is a task that implicitly iterates over all of its named sub-properties (AKA targets) if no target was specified. In addition to the default properties and methods, extra multi task-specific properties are available inside the task function as properties of the `this` object.

Many of the built-in tasks, including the [lint task](task_lint.md), [concat task](task_concat.md) and [min task](task_min.md) are multi tasks.

```javascript
grunt.registerMultiTask(taskName, description, taskFunction)
```

Given the specified configuration, this example multi task would log `foo: 1,2,3` if grunt was run via `grunt log:foo`, or it would log `bar: hello world` if grunt was run via `grunt log:bar`. If grunt was run as `grunt log` however, it would log `foo: 1,2,3` then `bar: hello world` then `baz: false`.

```javascript
grunt.initConfig({
  log: {
    foo: [1, 2, 3],
    bar: 'hello world',
    baz: false
  }
});

grunt.registerMultiTask('log', 'Log stuff.', function() {
  grunt.log.writeln(this.target + ': ' + this.data);
});
```

See the [creating tasks](types_of_tasks.md) documentation for more examples of multi tasks.

_This method is an alias for the [grunt.task.registerMultiTask](api_task.md) method._


### grunt.registerInitTask
Register an "init task." An init task is a task that doesn't require any configuration data, and as such will still run even if grunt can't find a [grunt.js gruntfile](getting_started.md). The included [init task](task_init.md) is an example of an "init task."

```javascript
grunt.registerInitTask(taskName, description, taskFunction)
```

For an init task example, see the [init task source](../tasks/init.js).

_This method is an alias for the [grunt.task.registerInitTask](api_task.md) method._

### grunt.renameTask
Rename a task. This might be useful if you want to override the default behavior of a task, while retaining the old name.

```javascript
grunt.renameTask(oldname, newname)
```

_This method is an alias for the [grunt.task.renameTask](api_task.md) method._

## Inside Tasks
An object is made available as `this` inside each task function that contains a number of useful task-specific properties and methods. This same object is also exposed as `grunt.task.current` for use in [templates](api_template.md).

### this.async / grunt.task.current.async
If a task is asynchronous, this method must be invoked to instruct grunt to wait. It returns a handle to a "done" function that should be called when the task has completed. `false` can be passed to the done function to indicate that the task has failed. If this method isn't invoked, the task executes synchronously.

```javascript
// Tell grunt this task is asynchronous.
var done = this.async();
// Your async code.
setTimeout(function() {
  // Let's simulate an error, sometimes.
  var success = Math.random() > 0.5;
  // All done!
  done(success);
}, 1000);
```

### this.requires / grunt.task.current.requires
If one task depends on the successful completion of another task (or tasks), this method can be used to force grunt to abort if the other task didn't run, or if the other task failed. The task list can be a space-separated string, an array of task names, or individual task name arguments.

Note that this won't actually run the specified task(s), it will just fail the current task if they haven't already run successfully.

```javascript
this.requires(taskList)
```

### this.requiresConfig / grunt.task.current.requiresConfig
Fail the current task if one or more required [config](api_config.md) properties is missing. One or more string or array config properties may be specified.

```javascript
this.requiresConfig(prop [, prop [, ...]])
```

See the [grunt.config documentation](api_config.md) for more information about config properties.

_This method is an alias for the [grunt.config.requires](api_config.md) method._

### this.name / grunt.task.current.name
The name of the task, as defined in `grunt.registerTask`. For example, if a "sample" task was run as `grunt sample` or `grunt sample:foo`, inside the task function, `this.name` would be `"sample"`.

### this.nameArgs / grunt.task.current.nameArgs
The name of the task, as specified with any colon-separated arguments or flags on the command-line. For example, if a "sample" task was run as `grunt sample:foo`, inside the task function, `this.nameArgs` would be `"sample:foo"`.

### this.args / grunt.task.current.args
An array of arguments passed to the task. For example, if a "sample" task was run as `grunt sample:foo:bar`, inside the task function, `this.args` would be `["foo", "bar"]`. Note that in multi tasks, the target is removed from the `this.args` array and is not passed into the task function.

### this.flags / grunt.task.current.flags
An object generated from the arguments passed to the task. For example, if a "sample" task was run as `grunt sample:foo:bar`, inside the task function, `this.flags` would be `{foo: true, bar: true}`. In a multi task, the target name is not set as a flag.

### this.errorCount / grunt.task.current.errorCount
The number of [grunt.log.error](api_log.md) calls that occurred during this task. This can be used to fail a task if errors occurred during the task.


## Inside Multi Tasks

### this.target / grunt.task.current.target
In a multi task, this is the name of the target currently being iterated over. For example, if a "sample" multi task was run as `grunt sample:foo` with the config data `{sample: {foo: "bar"}}`, inside the task function, `this.target` would be `"foo"`.

### this.data / grunt.task.current.data
In a multi task, this is the actual data stored in the grunt config object for the given target. For example, if a "sample" multi task was run as `grunt sample:foo` with the config data `{sample: {foo: "bar"}}`, inside the task function, `this.data` would be `"bar"`.

### this.file / grunt.task.current.file
In a multi task, target data can be stored in two different formats. A relatively basic "compact" format and a much more flexible "full" format. When the compact format is used, that key and value are made available as `this.file.dest` and `this.file.src`, respectively. When the full format is used, the specified `src` and `dest` values are used for `this.file.dest` and `this.file.src`.

Note that while grunt supports expanding [templates](api_template.md) for both `src` and `dest`, they only work for the `dest` file path when the _full_ format is used.

```javascript
grunt.initConfig({
  concat: {
    // This is the "compact" format.
    'dist/built.js': ['src/file1.js', 'src/file2.js'],
    // This is the "full" format.
    built: {
      src: ['src/file1.js', 'src/file2.js'],
      dest: 'dist/built.js'
    }
  }
});
```


## Loading Externally-Defined Tasks
For most projects, tasks and helpers will be defined in the [grunt.js gruntfile](getting_started.md). For larger projects, or in cases where tasks and helpers need to be shared across projects, tasks can be loaded from one or more external directories or Npm-installed grunt plugins.

_Note that the methods listed below are also available on the [grunt.task](api_task.md) object in addition to the `grunt` object._

### grunt.loadTasks
Load task-related files from the specified directory, relative to the [grunt.js gruntfile](getting_started.md). This method can be used to load task-related files from a local grunt plugin by specifying the path to that plugin's "tasks" subdirectory.

```javascript
grunt.loadTasks(tasksPath)
```

_This method is an alias for the [grunt.task.loadTasks](api_task.md) method._


### grunt.loadNpmTasks
Load tasks and helpers from the specified grunt plugin. This plugin must be installed locally via npm, and must be relative to the [grunt.js gruntfile](getting_started.md). Grunt plugins can be created by using the [gruntplugin init template](task_init.md).

```javascript
grunt.loadNpmTasks(pluginName)
```

_This method is an alias for the [grunt.task.loadNpmTasks](api_task.md) method._


## Defining and Executing Helpers
Helpers are utility functions that can be used by any task.

For example, in the [min task](../tasks/min.js), the majority of the actual minification work is done in an `uglify` helper, so that other tasks can utilize that minification code if they want to.

See the list of [built-in helpers](helpers_directives.md) for examples.

_Note that the methods listed below are also available on the [grunt.task](api_task.md) object in addition to the `grunt` object._

### grunt.registerHelper
Register a helper function that can be used by any task. When called as a directive, `this.directive` will be true inside of the helper.

```javascript
grunt.registerHelper(helperName, helperFunction)
```

In this example helper, the numbers `1` and `2` are passed in and the value `3` is returned.

```javascript
grunt.registerHelper('add_two_nums', function(a, b) {
  return a + b;
});
```

_This method is an alias for the [grunt.task.registerHelper](api_task.md) method._

### grunt.renameHelper
Rename a helper. This might be useful if you want to override the default behavior of a helper, while retaining the old name (to avoid having to completely recreate an already-made task just because you needed to override or extend a built-in helper).

```javascript
grunt.renameHelper(oldname, newname)
```

_This method is an alias for the [grunt.task.renameHelper](api_task.md) method._

### grunt.helper
Invoke a registered helper function.

```javascript
grunt.helper(helperName [, arguments...])
```

In this example, the previously defined `add_two_nums` helper is invoked.

```javascript
grunt.helper('add_two_nums', 1, 2) // 3
```

_This method is an alias for the [grunt.task.helper](api_task.md) method._


## Warnings and Fatal Errors
If something explodes (or is about to explode) inside a helper or task, it can force grunt to abort. See the [exit codes documentation](exit_codes.md) for a list of all built-in grunt exit codes.

### grunt.warn
Display a warning and abort grunt immediately. Grunt will continue processing tasks if the `--force` command-line option was specified. The `error` argument can be a string message or an error object.

```javascript
grunt.warn(error [, errorcode])
```

If `--debug 9` is specified on the command-line and an error object was specified, a stack trace will be logged.

_This method is an alias for the [grunt.fail.warn](api_fail.md) method._

### grunt.fatal
Display a warning and abort grunt immediately. The `error` argument can be a string message or an error object.

```javascript
grunt.fail(error [, errorcode])
```

If `--debug 9` is specified on the command-line and an error object was specified, a stack trace will be logged.

_This method is an alias for the [grunt.fail.fatal](api_fail.md) method._


## Command-line Options

### grunt.option
Retrieve the value of a command-line option, eg. `debug`. Note that for each command-line option, the inverse can be tested, eg. `no-debug`.

```javascript
grunt.option(optionName)
```

## Miscellaneous

### grunt.version
The current grunt version, as a string.

```javascript
grunt.version
```

### grunt.npmTasks
Inside a [grunt plugin](plugins.md) bin script, this method _must_ be called to inform grunt where to look for that plugin's tasks files. The `npmModuleName` must be the grunt plugin's Npm module name. The [gruntplugin init template](task_init.md), will automatically configure this for you.

```javascript
grunt.npmTasks(npmModuleName)
```

## Other Methods

* [grunt.utils](api_utils.md) - Miscellaneous utilities, including Underscore.js, Async and Hooker.
* [grunt.template](api_template.md) - Underscore.js template processing and other template-related methods.
* [grunt.task](api_task.md) - Register and run tasks and helpers, load external tasks.
* [grunt.file](api_file.md) - Wildcard expansion, file reading, writing, directory traversing.
* [grunt.config](api_config.md) - Access project-specific configuration data defined in the [grunt.js gruntfile](getting_started.md).
* [grunt.log](api_log.md), [grunt.verbose](api_log.md) - Output messages to the console.
* [grunt.fail](api_fail.md) - For when something goes horribly wrong.
