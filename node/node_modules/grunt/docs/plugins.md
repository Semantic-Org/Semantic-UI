[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# Plugins

This section is a work in progress. Grunt currently has preliminary plugin support, but it might be a little while before plugins work perfectly. If you have any suggestions or comments, please [file an issue](/gruntjs/grunt/issues) and we'll work it all out!

## Why create a grunt plugin?

Publishing a "grunt plugin" to Npm gives you 3 possible things:

1. An easily-included-in-your-project set of tasks that get referenced in `grunt.js` when run via `grunt`.
2. A custom global binary that is like "some version of grunt, plus your specific extra stuff."
3. Either 1 or 2, depending on whether the plugin was installed globally or locally via Npm.

Other than that, it's not too much more than a specific directory structure, contain some number of task files. You load a plugin locally installed via Npm via [grunt.loadNpmTasks](api.md), and you load tasks from a directory via [grunt.loadTasks](api.md).

## Plugin creation and development

1. Run `grunt init:gruntplugin` in an empty directory.
2. Run `npm install` to install grunt locally.
3. Run `./node_modules/.bin/grunt` to run the plugin-specific grunt. Just `grunt` won't work.
4. When done, run `npm publish` to publish the grunt plugin to npm!

## Two usage options

### 1. Global install, where you run `grunt-yourplugin`

1. Run `npm install -g grunt-yourplugin`. This installs the plugin globally, which contains its own internal grunt (the version specified in the plugin's package.json).
2. A new `grunt-yourplugin` binary should be globally available.
3. When run from that binary, the internal grunt runs, and provides grunt's internal tasks and helpers plus all the plugin's tasks and helpers.

Notes:

* When executed via the plugin binary, eg. `grunt-yourplugin`, the internally-specified grunt will be used. This allows you to "lock in" a specific version of grunt to your plugin.

### 2. Local install, where you run `grunt`

1. Grunt should already have been installed globally with `npm install -g grunt`.
2. In your project's root, next to the grunt.js gruntfile, run `npm install grunt-yourplugin`.
3. Add [grunt.loadNpmTasks('grunt-yourplugin')](api.md) into the project's grunt.js gruntfile.
2. Run `grunt` and all of the `grunt-yourplugin` tasks and helpers should be available in addition to those already provided by grunt..

Notes:

* Multiple plugins, eg. `grunt-yourplugin` and `grunt-anotherplugin` can be installed locally via Npm.
* [grunt.loadNpmTasks('grunt-yourplugin')](api.md) should behave exactly the same as [grunt.loadTasks('./node_modules/grunt-yourplugin/tasks')](api.md) does. It's less to type though, which is awesome.

## TODOS

* More docs.
