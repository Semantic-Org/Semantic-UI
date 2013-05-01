[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# server (built-in task)
Start a static web server.

## About

This task starts a static web server on a specified port, at a specified path, which runs as long as grunt is running. Once grunt's tasks have completed, the web server stops.

_Need some help getting started with grunt? Visit the [getting started](getting_started.md) page. And if you're creating your own tasks or helpers, be sure to check out the [types of tasks](types_of_tasks.md) page as well as the [API documentation](api.md)._

## A Very Important Note
Your `grunt.js` gruntfile **must** contain this code, once and **only** once. If it doesn't, grunt won't work. For the sake of brevity, this "wrapper" code has been omitted from all examples on this page, but it needs to be there.

```javascript
module.exports = function(grunt) {
  // Your grunt code goes in here.
};
```

## Project configuration

This example shows a brief overview of the [config](api_config.md) properties used by the `server` task. For a more in-depth explanation, see the usage examples.

```javascript
// Project configuration.
grunt.initConfig({
  // Configuration options.
  server: {}
});
```

## Usage examples

### Basic Use

In this example, `grunt server` will start a static web server at `http://localhost:8000/`, with its base path set to the gruntfile's directory. Of course, it will then immediately stop serving files, because grunt exits automatically when there are no more tasks to run.

The `server` task is most useful when used in conjunction with another task, like the [qunit](task_qunit.md) task.

```javascript
// Project configuration.
grunt.initConfig({
  server: {
    port: 8000,
    base: '.'
  }
});
```

### Roll Your Own

Unlike the previous example, in this example the `grunt server` command will run a completely custom `server` task, because it has been overridden. This version is hard-coded to start a static web server at `http://localhost:1234/`, with its base path set to `www-root` subdirectory.

Like the previous example, it will then immediately stop serving files, because grunt exits automatically when there are no more tasks to run, but you'll undoubtedly be running additional tasks after this one.

```javascript
// Project configuration.
grunt.initConfig({
  // This custom server task doesn't care about config options!
});

// Of course, you need to have the "connect" Npm module installed locally
// for this to work. But that's just a matter of running: npm install connect
var connect = require('connect');

// Redefining the "server" task for this project. Note that the output
// displayed by --help will reflect the new task description.
grunt.registerTask('server', 'Start a custom static web server.', function() {
  grunt.log.writeln('Starting static web server in "www-root" on port 1234.');
  connect(connect.static('www-root')).listen(1234);
});
```

See the [server task source](../tasks/server.js) for more information.
