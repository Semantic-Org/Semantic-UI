# grunt-contrib-uglify [![Build Status](https://travis-ci.org/gruntjs/grunt-contrib-uglify.png?branch=master)](https://travis-ci.org/gruntjs/grunt-contrib-uglify)

> Minify files with UglifyJS.



## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-contrib-uglify --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-contrib-uglify');
```




## Uglify task
_Run this task with the `grunt uglify` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.
### Options

This task primarily delegates to [UglifyJS2][], so please consider the [UglifyJS documentation][] as required reading for advanced configuration.

[UglifyJS2]: https://github.com/mishoo/UglifyJS2
[UglifyJS documentation]: http://lisperator.net/uglifyjs/

#### mangle
Type: `Boolean` `Object`
Default: `{}`

Turn on or off mangling with default options. If an `Object` is specified, it is passed directly to `ast.mangle_names()` *and* `ast.compute_char_frequency()` (mimicking command line behavior).

#### compress
Type: `Boolean` `Object`
Default: `{}`

Turn on or off source compression with default options. If an `Object` is specified, it is passed as options to `UglifyJS.Compressor()`.

#### beautify
Type: `Boolean` `Object`
Default: `false`

Turns on beautification of the generated source code. An `Object` will be merged and passed with the options sent to `UglifyJS.OutputStream()`

#### report
Choices: `false` `'min'` `'gzip'`
Default: `false`

Either do not report anything, report only minification result, or report minification and gzip results. This is useful to see exactly how well Uglify is performing, but using `'gzip'` can add 5-10x runtime task execution.

Example ouput using `'gzip'`:

```
Original: 198444 bytes.
Minified: 101615 bytes.
Gzipped:  20084 bytes.
```

#### sourceMap
Type: `String`  `Function`
Default: `undefined`

The location to output the sourcemap. If a function is provided, the uglify destination is passed as the argument
and the return value will be used as the sourceMap name.

#### sourceMapRoot
Type: `String`
Default: `undefined`

The location where your source files can be found. This sets the sourceRoot field in the source map.

#### sourceMapIn
Type: `String`
Default: `undefined`

The location of an input source map from an earlier compilation, e.g. from CoffeeScript.

#### sourceMappingURL
Type: `String`  `Function`
Default: `undefined`

The location of your sourcemap. Defaults to the location you use for sourceMap, override if you need finer control. Provide
a function to dynamically generate the sourceMappingURL based off the destination.

#### sourceMapPrefix
Type: `Number`
Default: `undefined`

The number of directories to drop from the path prefix when declaring files in the source map.

#### wrap
Type: `String`
Default: `undefined`

Wrap all of the code in a closure, an easy way to make sure nothing is leaking.
For variables that need to be public `exports` and `global` variables are made available.
The value of wrap is the global variable exports will be available as.

#### exportAll
Type: `Boolean`
Default: `false`

When using `wrap` this will make all global functions and variables available via the export variable.

#### preserveComments
Type: `Boolean` `String` `Function`
Default: `undefined`
Options: `false` `'all'` `'some'`

Turn on preservation of comments.

- `false` will strip all comments
- `'all'` will preserve all comments in code blocks that have not been squashed or dropped
- `'some'` will preserve all comments that start with a bang (`!`) or include a closure compiler style directive (`@preserve` `@license` `@cc_on`)
- `Function` specify your own comment preservation function. You will be passed the current node and the current comment and are expected to return either `true` or `false`

#### banner
Type: `String`
Default: empty string

This string will be prepended to the beginning of the minified output. It is processed using [grunt.template.process][], using the default options.

_(Default processing options are explained in the [grunt.template.process][] documentation)_

[grunt.template.process]: https://github.com/gruntjs/grunt/wiki/grunt.template#wiki-grunt-template-process


### Usage examples

#### Basic compression

This configuration will compress and mangle the input files using the default options.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      files: {
        'dest/output.min.js': ['src/input1.js', 'src/input2.js']
      }
    }
  }
});
```

#### No mangling

Specify `mangle: false` to prevent changes to your variable and function names.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      mangle: false
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Reserved identifiers

You can specify identifiers to leave untouched with an `except` array in the `mangle` options.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      mangle: {
        except: ['jQuery', 'Backbone']
      }
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Source maps

Configure basic source map output by specifying a file path for the `sourceMap` option.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        sourceMap: 'path/to/source-map.js'
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Advanced source maps

You can specify the parameters to pass to `UglifyJS.SourceMap()` which will
allow you to configure advanced settings.

Refer to the [UglifyJS SourceMap Documentation](http://lisperator.net/uglifyjs/codegen#source-map) for more information.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        sourceMap: 'path/to/source-map.js',
        sourceMapRoot: 'http://example.com/path/to/src/', // the location to find your original source
        sourceMapIn: 'example/coffeescript-sourcemap.js', // input sourcemap from a previous compilation
        }
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```


#### Beautify

Specify `beautify: true` to beautify your code for debugging/troubleshooting purposes.
Pass an object to manually configure any other output options passed directly to `UglifyJS.OutputStream()`.

See [UglifyJS Codegen documentation](http://lisperator.net/uglifyjs/codegen) for more information.

_Note that manual configuration will require you to explicitly set `beautify: true` if you want traditional, beautified output._

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    my_target: {
      options: {
        beautify: true
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    },
    my_advanced_target: {
      options: {
        beautify: {
          width: 80,
          beautify: true
        }
      },
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Banner comments

In this example, running `grunt uglify:my_target` will prepend a banner created by interpolating the `banner` template string with the config object. Here, those properties are the values imported from the `package.json` file (which are available via the `pkg` config property) plus today's date.

_Note: you don't have to use an external JSON file. It's also valid to create the `pkg` object inline in the config. That being said, if you already have a JSON file, you might as well reference it._

```js
// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  uglify: {
    options: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```

#### Conditional compilation

You can also enable UglifyJS conditional compilation. This is commonly used to remove debug code blocks for production builds.

See [UglifyJS global definitions documentation](http://lisperator.net/uglifyjs/compress#global-defs) for more information.

```js
// Project configuration.
grunt.initConfig({
  uglify: {
    options: {
      compress: {
        global_defs: {
          "DEBUG": false
        },
        dead_code: true
      }
    },
    my_target: {
      files: {
        'dest/output.min.js': ['src/input.js']
      }
    }
  }
});
```


## Release History

 * 2013-05-31   v0.2.2   Reverted /56 due to /58 until [chrome/239660](https://code.google.com/p/chromium/issues/detail?id=239660&q=sourcemappingurl&colspec=ID%20Pri%20M%20Iteration%20ReleaseBlock%20Cr%20Status%20Owner%20Summary%20OS%20Modified) [firefox/870361](https://bugzilla.mozilla.org/show_bug.cgi?id=870361) drop
 * 2013-05-22   v0.2.1   Bumped uglify to ~2.3.5 /55 /40 Changed sourcemappingUrl syntax /56 Disabled sorting of names for consistent mangling /44 Updated docs for sourceMapRoot /47 /25
 * 2013-03-14   v0.2.0   No longer report gzip results by default. Support `report` option.
 * 2013-01-30   v0.1.2   Added better error reporting Support for dynamic names of multiple sourcemaps
 * 2013-02-15   v0.1.1   First official release for Grunt 0.4.0.
 * 2013-01-18   v0.1.1rc6   Updating grunt/gruntplugin dependencies to rc6. Changing in-development grunt/gruntplugin dependency versions from tilde version ranges to specific versions.
 * 2013-01-09   v0.1.1rc5   Updating to work with grunt v0.4.0rc5. Switching back to this.files api.
 * 2012-11-28   v0.1.0   Work in progress, not yet officially released.

---

Task submitted by ["Cowboy" Ben Alman](http://benalman.com)

*This file was generated on Fri May 31 2013 16:43:42.*
