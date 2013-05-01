[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# qunit (built-in task)
Run [QUnit][qunit] unit tests in a headless [PhantomJS][phantom] instance.

[qunit]: http://docs.jquery.com/QUnit
[phantom]: http://www.phantomjs.org/

## About

This task is a [multi task](types_of_tasks.md), meaning that grunt will automatically iterate over all `qunit` targets if a target is not specified.

_Need some help getting started with grunt? Visit the [getting started](getting_started.md) page. And if you're creating your own tasks or helpers, be sure to check out the [types of tasks](types_of_tasks.md) page as well as the [API documentation](api.md)._

### QUnit

[QUnit][qunit] is a powerful, easy-to-use, JavaScript test suite. It's used by the jQuery project to test its code and plugins but is capable of testing any generic JavaScript code.

### PhantomJS

[PhantomJS](http://www.phantomjs.org/) is a headless WebKit with JavaScript API. It has fast and native support for various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG. PhantomJS is required for the `qunit` task to work.

See the [FAQ](faq.md) for instructions on installing PhantomJS.


## A Very Important Note
Your `grunt.js` gruntfile **must** contain this code, once and **only** once. If it doesn't, grunt won't work. For the sake of brevity, this "wrapper" code has been omitted from all examples on this page, but it needs to be there.

```javascript
module.exports = function(grunt) {
  // Your grunt code goes in here.
};
```

## Project configuration

This example shows a brief overview of the [config](api_config.md) properties used by the `qunit` task. For a more in-depth explanation, see the usage examples.

```javascript
// Project configuration.
grunt.initConfig({
  // Lists of files or URLs to be unit tested with QUnit.
  qunit: {}
});
```

## Usage examples

### Wildcards

In this example, `grunt qunit` will test all `.html` files in the test directory. First, the wildcard is expanded to match each individual file. Then, each matched filename is converted to the appropriate `file://` URI. Finally, [QUnit][qunit] is run for each URI.

```javascript
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/*.html']
  }
});
```

With a slight modification, `grunt qunit` will test all `.html` files in the test directory _and all subdirectories_. See the [minimatch](https://github.com/isaacs/minimatch) module's documentation for more details on wildcard patterns.

```javascript
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['test/**/*.html']
  }
});
```

### Testing via http:// or https://

In circumstances where running unit tests from `file://` URIs is inadequate, you can specify `http://` or `https://` URIs instead. If `http://` or `https://` URIs have been specified, those URIs will be passed directly into [QUnit][qunit] as-specified.

In this example, `grunt qunit` will test two files, served from the server running at `localhost:8000`.

```javascript
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['http://localhost:8000/test/foo.html', 'http://localhost:8000/test/bar.html']
  }
});
```

_Note: grunt does NOT start a server at `localhost:8000` automatically. While grunt DOES have a [server task](task_server.md) that can be run before the qunit task to serve files statically, it must be started manually..._

### Using the built-in static webserver

If a web server isn't running at `localhost:8000`, running `grunt qunit` with `http://localhost:8000/` URIs will fail because grunt won't be able to load those URIs. This can be easily rectified by starting the built-in static web server via the [server task](task_server.md).

In this example, running `grunt server qunit` will first start a static web server on `localhost:8000`, with its base path set to the gruntfile's directory. Then, the `qunit` task will be run, requesting the specified URIs from that server.

```javascript
// Project configuration.
grunt.initConfig({
  qunit: {
    all: ['http://localhost:8000/test/foo.html', 'http://localhost:8000/test/bar.html']
  },
  server: {
    port: 8000,
    base: '.'
  }
});

// A convenient task alias.
grunt.registerTask('test', 'server qunit');
```

_Note: in the above example, an [alias task](types_of_tasks.md) called `test` was created that runs both the `server` and `qunit` tasks._

## Debugging

Running grunt with the `--debug` flag will output a lot of PhantomJS-specific debugging information. This can be very helpful in seeing what actual URIs are being requested and received by PhantomJS.

See the [qunit task source](../tasks/qunit.js) for more information.
