[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# lint (built-in task)
Validate files with [JSHint][jshint].

[jshint]: http://www.jshint.com/

## About

This task is a [multi task](types_of_tasks.md), meaning that grunt will automatically iterate over all `lint` targets if a target is not specified.

_Need some help getting started with grunt? Visit the [getting started](getting_started.md) page. And if you're creating your own tasks or helpers, be sure to check out the [types of tasks](types_of_tasks.md) page as well as the [API documentation](api.md)._

## A Very Important Note
Your `grunt.js` gruntfile **must** contain this code, once and **only** once. If it doesn't, grunt won't work. For the sake of brevity, this "wrapper" code has been omitted from all examples on this page, but it needs to be there.

```javascript
module.exports = function(grunt) {
  // Your grunt code goes in here.
};
```

## Project configuration

This example shows a brief overview of the [config](api_config.md) properties used by the `lint` task. For a more in-depth explanation, see the usage examples.

```javascript
// Project configuration.
grunt.initConfig({
  // Lists of files to be linted with JSHint.
  lint: {}
});
```

## Usage examples

### Wildcards

In this example, running `grunt lint` will lint the project's gruntfile as well as all JavaScript files in the `lib` and `test` directories, using the default JSHint `options` and `globals`.

```javascript
// Project configuration.
grunt.initConfig({
  lint: {
    files: ['grunt.js', 'lib/*.js', 'test/*.js']
  }
});
```

With a slight modification, running `grunt lint` will also lint all JavaScript files in the `lib` and `test` directories _and all subdirectories_. See the [minimatch](https://github.com/isaacs/minimatch) module documentation for more details on wildcard patterns.

```javascript
// Project configuration.
grunt.initConfig({
  lint: {
    files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
  }
});
```

### Linting before and after concat

In this example, running `grunt lint` will lint two separate sets of files using the default JSHint `options` and `globals`: one "beforeconcat" set, and one "afterconcat" set. Running `grunt lint` will lint both sets of files all at once, because lint is a [multi task](types_of_tasks.md). This is not ideal, because `dist/output.js` may get linted before it gets created via the [concat task](task_concat.md)!

In this case, you should lint the "beforeconcat" set first, then concat, then lint the "afterconcat" set, by running `grunt lint:beforeconcat concat lint:afterconcat`.

```javascript
// Project configuration.
grunt.initConfig({
  concat: {
    dist: {
      src: ['src/foo.js', 'src/bar.js'],
      dest: 'dist/output.js'
    }
  },
  lint: {
    beforeconcat: ['src/foo.js', 'src/bar.js'],
    afterconcat: ['dist/output.js']
  }
});

// Default task.
grunt.registerTask('default', 'lint:beforeconcat concat lint:afterconcat');
```

_Note: in the above example, a default [alias task](types_of_tasks.md) was created that runs the 'lint:beforeconcat', 'concat' and 'lint:afterconcat' tasks. If you didn't want this to be the default grunt task, you could give it a different name._

### Dynamic filenames

Building on the previous example, if you want to avoid duplication, you can use a [directive](helpers_directives.md) like `'<config:concat.dist.dest>'` in place of `'dist/output.js'` in the `afterconcat` lint target. This allows you to generate the output filename dynamically. In this example, the `concat:dist` destination filename is generated from the `name` and `version` properties of the referenced `package.json` file through the `pkg` config property.

```javascript
// Project configuration.
grunt.initConfig({
  pkg: '<json:package.json>',
  concat: {
    dist: {
      src: ['src/foo.js', 'src/bar.js'],
      dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
    }
  },
  lint: {
    beforeconcat: ['src/foo.js', 'src/bar.js'],
    afterconcat: ['<config:concat.dist.dest>']
  }
});
```

### Specifying JSHint options and globals

In this example, taken from the [Sample jQuery plugin gruntfile](https://github.com/gruntjs/grunt-init-jquery-sample/blob/master/grunt.js), custom JSHint `options` and `globals` are specified. These options are explained in the [JSHint documentation](http://www.jshint.com/options/).

_Note: config `jshint.options` and `jshint.globals` apply to the entire project, but can be overridden with per-file comments like `/*global exports:false*/`._

```javascript
// Project configuration.
grunt.initConfig({
  lint: {
    files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
  },
  jshint: {
    options: {
      curly: true,
      eqeqeq: true,
      immed: true,
      latedef: true,
      newcap: true,
      noarg: true,
      sub: true,
      undef: true,
      eqnull: true,
      browser: true
    },
    globals: {
      jQuery: true
    }
  },
});
```

#### Per-target JSHint options and globals

For each `lint` target, grunt looks for a target-named object underneath the `jshint` config object. If this object is found, its `options` and `globals` sub-objects will be used instead of the global ones. this allows per-lint-target JSHint options/globals overrides.

In this example, there are default JSHint settings, as well as per-target overrides:

```javascript
// Project configuration.
grunt.initConfig({
  lint: {
    src: 'src/*.js',
    grunt: 'grunt.js',
    tests: 'tests/unit/**/*.js'
  },
  jshint: {
    // Defaults.
    options: {curly: true},
    globals: {},
    // Just for the lint:grunt target.
    grunt: {
      options: {node: true},
      globals: {task: true, config: true, file: true, log: true, template: true}
    },
    // Just for the lint:src target.
    src: {
      options: {browser: true},
      globals: {jQuery: true}
    },
    // Just for the lint:tests target.
    tests: {
      options: {jquery: true},
      globals: {module: true, test: true, ok: true, equal: true, deepEqual: true, QUnit: true}
    }
  }
});
```

## Helpers

A generic `lint` helper is available for use in any other task where file linting might be useful. For example:

```javascript
var filename = 'example.js';
var src = grunt.file.read(filename);
grunt.helper('lint', src, {browser: true}, {jQuery: true}, filename);
```

See the [lint task source](../tasks/lint.js) for more information.
