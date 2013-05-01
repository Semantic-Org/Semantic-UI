[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# [The grunt API](api.md) / grunt.task

Register and run tasks and helpers, load external tasks.

See the [task lib source](../lib/grunt/task.js) and [task util lib source](../lib/util/task.js) for more information.

## The task API

Note that any method marked with a ☃ (unicode snowman) is also available directly on the `grunt` object. Just so you know. See the [API main page](api.md) for more usage information.


## Creating Tasks
Tasks are grunt's bread and butter. The stuff you do most often, like `lint` or `test`. Every time grunt is run, you specify one more more tasks to run, which tells grunt what you'd like it to do.

If you don't specify a task, but a task named "default" has been defined, that task will run (unsurprisingly) by default.

### grunt.task.registerTask ☃
Register an "alias task" or a task function. This method supports the following two signatures:

**Alias task**

If a task list is specified, the new task will be an alias for one or more other tasks. Whenever this "alias task" is run, every specified task in `taskList` will be run, in the order specified. The `taskList` argument can be a space-separated string or an array of task names.

```javascript
grunt.task.registerTask(taskName, taskList)
```

This example alias task defines a "default" task whereby the "lint", "qunit", "concat" and "min" tasks are run automatically if grunt is executed without any tasks specified:

```javascript
task.registerTask('default', 'lint qunit concat min');
```

**Function task**

If a `description` and `taskFunction` are passed, the specified function will be executed whenever the task is run. In addition, the specified description will be shown when `grunt --help` is run. Task-specific properties and methods are available inside the task function as properties of the `this` object. The task function can return `false` to indicate that the task has failed.

Note that the `grunt.task.registerMultiTask` method, explained below, can be used to define a special type of task known as a "multi task."

```javascript
grunt.task.registerTask(taskName, description, taskFunction)
```

This example task logs `foo, testing 123` if grunt is run via `grunt foo:testing:123`. If the task is run without arguments as `grunt foo` the task logs `foo, no args`.

```javascript
grunt.task.registerTask('foo', 'A sample task that logs stuff.', function(arg1, arg2) {
  if (arguments.length === 0) {
    grunt.log.writeln(this.name + ", no args");
  } else {
    grunt.log.writeln(this.name + ", " + arg1 + " " + arg2);
  }
});
```

See the [creating tasks](types_of_tasks.md) documentation for more examples of tasks and alias tasks.

_This method is also available as [grunt.registerTask](api.md)._


### grunt.task.registerMultiTask ☃
Register a "multi task." A multi task is a task that implicitly iterates over all of its named sub-properties (AKA targets) if no target was specified. In addition to the default properties and methods, extra multi task-specific properties are available inside the task function as properties of the `this` object.

Many of the built-in tasks, including the [lint task](task_lint.md), [concat task](task_concat.md) and [min task](task_min.md) are multi tasks.

```javascript
grunt.task.registerMultiTask(taskName, description, taskFunction)
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

grunt.task.registerMultiTask('log', 'Log stuff.', function() {
  grunt.log.writeln(this.target + ': ' + this.data);
});
```

See the [creating tasks](types_of_tasks.md) documentation for more examples of multi tasks.

_This method is also available as [grunt.registerMultiTask](api.md)._


### grunt.task.registerInitTask ☃
Register an "init task." An init task is a task that doesn't require any configuration data, and as such will still run even if grunt can't find a [grunt.js gruntfile](getting_started.md). The included [init task](task_init.md) is an example of an "init task."

```javascript
grunt.task.registerInitTask(taskName, description, taskFunction)
```

For an init task example, see the [init task source](../tasks/init.js).

_This method is also available as [grunt.registerInitTask](api.md)._

### grunt.task.renameTask ☃
Rename a task. This might be useful if you want to override the default behavior of a task, while retaining the old name.

```javascript
grunt.task.renameTask(oldname, newname)
```

_This method is also available as [grunt.renameTask](api.md)._

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

### grunt.task.loadTasks ☃
Load task-related files from the specified directory, relative to the [grunt.js gruntfile](getting_started.md). This method can be used to load task-related files from a local grunt plugin by specifying the path to that plugin's "tasks" subdirectory.

```javascript
grunt.task.loadTasks(tasksPath)
```

_This method is also available as [grunt.loadTasks](api.md)._


### grunt.task.loadNpmTasks ☃
Load tasks and helpers from the specified grunt plugin. This plugin must be installed locally via npm, and must be relative to the [grunt.js gruntfile](getting_started.md). Grunt plugins can be created by using the [gruntplugin init template](task_init.md).

```javascript
grunt.task.loadNpmTasks(pluginName)
```

_This method is also available as [grunt.loadNpmTasks](api.md)._


## Helpers
Helpers are utility functions that can be used by any task.

For example, in the [min task](../tasks/min.js), the majority of the actual minification work is done in an `uglify` helper, so that other tasks can utilize that minification code if they want to.

See the list of [built-in helpers](helpers_directives.md) for examples.

### grunt.task.registerHelper ☃
Register a helper function that can be used by any task. When called as a directive, `this.directive` will be true inside of the helper.

```javascript
grunt.task.registerHelper(helperName, helperFunction)
```

In this example helper, the numbers `1` and `2` are passed in and the value `3` is returned.

```javascript
grunt.task.registerHelper("add_two_nums", function(a, b) {
  return a + b;
});
```

_This method is also available as [grunt.registerHelper](api.md)._

### grunt.task.renameHelper ☃
Rename a helper. This might be useful if you want to override the default behavior of a helper, while retaining the old name (to avoid having to completely recreate an already-made task just because you needed to override or extend a built-in helper).

```javascript
grunt.task.renameHelper(oldname, newname)
```

_This method is also available as [grunt.renameHelper](api.md)._

### grunt.task.helper ☃
Invoke a registered helper function.

```javascript
grunt.task.helper(helperName [, arguments...])
```

In this example, the previously defined `add_two_nums` helper is invoked.

```javascript
grunt.task.helper("add_two_nums", 1, 2) // 3
```

_This method is also available as [grunt.helper](api.md)._

## Directives
Directives are essentially string placeholders for helper functions, specified as values in the [config object](getting_started.md).

A good example of directives would be the `<json:package.json>` and `<config:lint.all>` directives in grunt's own [grunt.js gruntfile](../grunt.js). Or the `<banner>` and `<file_strip_banner:src/grunt-init-jquery-sample.js>` directives in the [sample jQuery plugin gruntfile](https://github.com/gruntjs/grunt-init-jquery-sample/blob/master/grunt.js).

See the list of [built-in directives](helpers_directives.md) for examples.

### grunt.task.directive
Manually execute a helper based on the passed string directive, returning its value. Note that this only works for synchronous helpers. When called as a directive, `this.directive` will be true inside of the helper.

```javascript
grunt.task.directive(directive)
```

In this example, note that the arguments passed into the helper must be coerced into numbers because all directive arguments are passed into the helper as strings.

```javascript
grunt.task.registerHelper('add_two_numbers', function(a, b) {
  return Number(a) + Number(b);
});

grunt.task.directive('<add_two_numbers:1:2>') // 3
```

### grunt.task.getDirectiveParts
Split a valid directive into its components. Returns `null` if the string can't be parsed as a directive or if the directive doesn't match an existing helper.

```javascript
grunt.task.getDirectiveParts(directive)
```

In this example, the directive can't be parsed initially because the appropriate helper hasn't been defined. Once the helper has been defined, the directive can be parsed.

```javascript
grunt.task.getDirectiveParts('<foo:bar:baz>') // null

grunt.task.registerHelper('foo', function() {});
grunt.task.getDirectiveParts('<foo:bar:baz>') // ['foo', 'bar', 'baz']
```


## Queueing Tasks
Grunt automatically enqueues and runs all tasks specified on the command line, but individual tasks can enqueue additional tasks to be run.

### grunt.task.run
Enqueue one or more tasks. Every specified task in `taskList` will be run immediately after the current task completes, in the order specified. The task list can be a space-separated string, an array of task names, or individual task name arguments.

```javascript
grunt.task.run(taskList)
```

See the [watch task source](../tasks/watch.js) for an example.

### grunt.task.clearQueue
Empty the task queue completely. Unless additional tasks are enqueued, no more tasks will be run.

```javascript
grunt.task.clearQueue()
```

See the [watch task source](../tasks/watch.js) for an example.


## Search Directories
For a given tasks file or related task "extra" file, these paths will be searched in this order, aka "task path order," until the first matching file is found.

1. The grunt user tasks directory, ie. `grunt.file.userDir('tasks')`.
2. Npm-installed [grunt plugins](plugins.md) or tasks directories specified on the command-line via the `--tasks` option.
3. Npm-installed grunt plugins, tasks directories or individual tasks and helpers specified in the [grunt.js gruntfile](getting_started.md).
4. Task directories built-in to a Npm-installed grunt plugin run via its `grunt-` named binary.
5. The [built-in grunt tasks directory](../tasks).

This allows referenced Npm-installed grunt plugins, tasks directories, the [grunt.js gruntfile](getting_started.md) and even the user to override grunt functionality as needed.

For example, a grunt plugin may add a new "foo" task in its `tasks/foo.js`, completely override an existing task like the [concat task](task_concat.md) in its `tasks/concat.js` or add a new "bar" [init task](task_init.md) template with its `tasks/init/bar.js` and "extra" files in its `tasks/init/bar/` directory. In your personal user tasks directory, you can create your own "baz" init task template with a `tasks/init/baz.js` file or even override individual init template "extra" files like `tasks/init/jquery/root/README.md` just by creating them.

**When defining project-specific tasks or "extra" files, it's always a good idea to include those files in a grunt plugin or tasks directory referenced in the [grunt.js gruntfile](getting_started.md), and committed with the project when possible. This will help to guarantee consistent grunt behavior for all contributors to that project.**

### grunt.task.searchDirs
An array of directory paths that grunt uses to search for task-related files, in "task path order." This array is used by all task-specific file listing methods.

```javascript
grunt.task.searchDirs
```


## File Lists and Wildcards
Wildcard patterns are resolved using the [glob-whatev library](https://github.com/cowboy/node-glob-whatev). See the [minimatch](https://github.com/isaacs/minimatch) module documentation for more details on supported wildcard patterns.

There are also a number of [generic file listing methods](api_file.md) that list files relative to the [grunt.js gruntfile](getting_started.md).

### grunt.task.getFile
Search tasks directories in "task path order" (via `grunt.task.searchDirs`) for a given file path, returning the path of the first matching file.

**This is the primary method used to locate tasks files and extras files.**

_Like the Node.js [path.join](http://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method, this method will join all arguments together and normalize the resulting path._

```javascript
grunt.task.getFile(path1 [, path2 [, ...]])
```

### grunt.task.expand
Search task "search directories" for the given wildcard pattern(s), returning a unique array of all matching file paths as "file objects" in `grunt.task.searchDirs` "task path order." This method accepts one or more comma separated wildcard patterns as well as an array of wildcard patterns.

The `options` object supports all [minimatch](https://github.com/isaacs/minimatch) options.

```javascript
grunt.task.expand([options, ] patterns)
```

Each "file object" item in the returned array has the following properties, and if coerced to string via `String(fileobj)` or `fileObj.toString()` returns the absolute file path value. In this way, `.map(String)` can be called on the resulting array to return an array of absolute file path strings.

```javascript
var fileobj = {
  // The absolute path of the matched file or directory.
  abs: absolutePath,
  // The path of the matched file or directory, relative to the search
  // directory in which it was found.
  rel: relativePath,
  // The search directory in which this file was found.
  base: basePath
}
```

### grunt.task.expandDirs
This method behaves the same as `grunt.task.expand` except it only returns directory paths.

```javascript
grunt.task.expandDirs([options, ] patterns)
```

### grunt.task.expandFiles
This method behaves the same as `grunt.task.expand` except it only returns file paths.

```javascript
grunt.task.expandFiles([options, ] patterns)
```

## JSON Defaults

### grunt.task.readDefaults
Search tasks directories for a given JSON file, merging the parsed data objects in "task path order" and returning the final merged object.

**This is the primary method used to load task-related JSON default data.**

_Like the Node.js [path.join](http://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method, this method will join all arguments together and normalize the resulting path._

```javascript
grunt.task.readDefaults(path1 [, path2 [, ...]])
```
