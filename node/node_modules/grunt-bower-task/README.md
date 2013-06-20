# grunt-bower-task [![Build Status](https://travis-ci.org/yatskevich/grunt-bower-task.png)](https://travis-ci.org/yatskevich/grunt-bower-task)

> Install Bower packages. Smartly.

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

Please note, this plugin works **only with grunt 0.4+**. If you are using grunt 0.3.x then consider an [upgrade to 0.4][].

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-bower-task --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-bower-task');
```

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[package.json]: https://npmjs.org/doc/json.html
[upgrade to 0.4]: https://github.com/gruntjs/grunt/wiki/Upgrading-from-0.3-to-0.4

## Grunt task for Bower

### Overview
In your project's Gruntfile, add a section named `bower` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  bower: {
    install: {
       //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
    }
  },
})
```

### Options

#### options.targetDir
Type: `String`
Default value: `./lib`

A directory where you want to keep your Bower packages.

### options.install
Type: `Boolean`
Default value: `true`

Whether you want to run bower install task itself (e.g. you might not want to do this each time on CI server).

### options.cleanTargetDir
Type: `Boolean`
Default value: `false`

Will clean target dir before running install.

### options.cleanBowerDir
Type: `Boolean`
Default value: `false`

Will remove bower's dir after copying all needed files into target dir.

### options.copy
Type: `Boolean`
Default value: `true`

Copy Bower packages to target directory.

#### options.cleanup
Type: `boolean`
Default value: `undefined`

**NOTE:** If set to true or false then both `cleanBowerDir` & `cleanTargetDir` are set to the value of `cleanup`.

#### options.layout
Type: `string` or `function`
Default value: `byType`

There are two built-in named layouts: `byType` and `byComponent`.

`byType` layout will produce the following structure:

```
lib
|-- js
|   |- bootstrap
|   \- require
|-- css
    \- bootstrap
```
where `js`, `css` come from `exportsOverride` section described below.

`byComponent` will group assets by type under component name:

```
lib
|-- bootstrap
|   |- js
|   \- css
|-- require
    \- js
```

If you need to support custom layout then you can specify `layout` as a function of `type` and `component`:

```js
var path = require('path');

grunt.initConfig({
  bower: {
    install: {
      options: {
        layout: function(type, component) {
          var renamedType = type;
          if (type == 'js') renamedType = 'javascripts';
          else if (type == 'css') renamedType = 'stylesheets';

          return path.join(component, renamedType);
        }
      }
    }
  }
});
```

#### options.verbose
Type: `boolean`
Default value: `false`

The task will provide more (debug) output when this option is set to `true`. You can also use `--verbose` when running task for same effect.

### Usage Examples

#### Default Options
Default options are good enough if you want to install Bower packages and keep only `"main"` files (as specified by package's `component.json`) in separate directory.

```js
grunt.initConfig({
  bower: {
    install: {
      options: {
        targetDir: './lib',
        layout: 'byType',
        install: true,
        verbose: false,
        cleanTargetDir: false,
        cleanBowerDir: false
      }
    }
  },
})
```

#### Custom Options
In this initial version there are no more options in plugin itself. **BUT!**

### Advanced usage
At this point of time "Bower package" = "its git repository". It means that package includes tests, licenses, etc.
Bower's community actively discusses this issue (GitHub issues [#46][],[#88][], [on Google Groups][GG])
That's why you can find such tools like [blittle/bower-installer][] which inspired this project.

[GG]: https://groups.google.com/forum/?fromgroups=#!topic/twitter-bower/SQEDDA_gmh0
[#88]: https://github.com/twitter/bower/issues/88
[#46]: https://github.com/twitter/bower/issues/46
[blittle/bower-installer]: https://github.com/blittle/bower-installer

Okay, if you want more than `"main"` files in `./lib` directory then put `"exportsOverride"` section into your `component.json`:

```json
{
  "name": "simple-bower",
  "version": "0.0.0",
  "dependencies": {
    "jquery": "~1.8.3",
    "bootstrap-sass": "*",
    "requirejs": "*"
  },
  "exportsOverride": {
    "bootstrap-sass": {
      "js": "js/*.js",
      "scss": "lib/*.scss",
      "img": "img/*.png"
    },
    "requirejs": {
      "js": "require.js"
    }
  }
}
```
`grunt-bower-task` will do the rest:

* If Bower package has defined `"main"` files then they will be copied to `./lib/<package>/`.
* If `"main"` files are empty then the whole package directory will be copied to `./lib`.
* When you define `"exportsOverride"` only asset types and files specified by you will be copied to `./lib`.

For the example above you'll get the following files in `.lib` directory:

```
jquery/jquery.js
js/bootstrap-sass/bootstrap-affix.js
...
js/bootstrap-sass/bootstrap-typeahead.js
js/requirejs/require.js
scss/bootstrap-sass/_accordion.scss
...
scss/bootstrap-sass/_wells.scss
scss/bootstrap-sass/bootstrap.scss
scss/bootstrap-sass/responsive.scss
img/bootstrap-sass/glyphicons-halflings-white.png
img/bootstrap-sass/glyphicons-halflings.png
```

## Contributing
Please, use `devel` branch for all pull requests.

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][].

## Release History
* 2013/05/11 - v0.2.3 - Update to bower 0.9.x, docs improvement, Windows-compatible paths in tests.
* 2013/04/23 - v0.2.2 - Fix backward-compatibility issue (related to `cleanup` option).
* 2013/04/22 - v0.2.1 - Split 'install' to 'install' and 'copy' steps to support flexible workflow, add support for grunt's `--base` option.
* 2013/03/30 - v0.2.0 - Added support for flexible assets layout, honor native Bower's configuration, reduce log output.
* 2013/03/18 - v0.1.1 - Updated dependencies, minor fixes.
* 2012/11/25 - v0.1.0 - Initial release.

## License
Copyright (c) 2012-2013 Ivan Yatskevich

Licensed under the MIT license.

<https://github.com/yatskevich/grunt-bower-task/blob/master/LICENSE-MIT>
