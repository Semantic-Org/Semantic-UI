[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# Frequently Asked Questions

## When will I be able to use in-development feature 'X'?
While critical bug fixes are applied to both the latest stable release as well as the in-development version of grunt, new features are usually only added to the in-development version.

If you want to install the latest bleeding-edge, in-development version, you can npm install `grunt@devel`. _This is something you do not want to do in a project_, as the in-development version of grunt is constantly evolving and a feature you've come to depend on may have changed between installs of `grunt@devel`, thus breaking your build.

If you want to install an in-development version of grunt, locked in at a specific commit (totally fine for projects), follow the instructions for specifying a [git URL as a dependency](https://npmjs.org/doc/json.html#Git-URLs-as-Dependencies), and be sure to specify an actual commit SHA (not a branch name) as the `commit-ish`.

Finally, it is preferable to specify grunt as a [devDependency](https://npmjs.org/doc/json.html#devDependencies) in your project's [package.json](https://npmjs.org/doc/json.html) and instruct users to do `npm install` than to have them install grunt explicitly with `npm install grunt`. This makes the task of installing grunt (and any other dev dependencies) much easier and less error-prone.

## On Windows, why does my JS editor open when I try to run grunt?
If you're in the same directory as the [grunt.js gruntfile](getting_started.md), Windows tries to execute _that file_ when you type grunt. So you need to type `grunt.cmd` instead.

An alternative would be to use the `DOSKEY` command to create a grunt macro, following [these directions](http://devblog.point2.com/2010/05/14/setup-persistent-aliases-macros-in-windows-command-prompt-cmd-exe-using-doskey/). That would allow you to use `grunt` instead of `grunt.cmd`.

This is the `DOSKEY` command you'd use:

```
DOSKEY grunt=grunt.cmd $*
```

## Why does grunt complain that PhantomJS isn't installed?
In order for the [qunit task](task_qunit.md) to work properly, [PhantomJS](http://www.phantomjs.org/) must be installed and in the system PATH (if you can run "phantomjs" at the command line, this task should work).

Unfortunately, PhantomJS cannot be installed automatically via npm or grunt, so you need to install it yourself. There are a number of ways to install PhantomJS.

* [PhantomJS and Mac OS X](http://ariya.ofilabs.com/2012/02/phantomjs-and-mac-os-x.html)
* [PhantomJS Installation](http://code.google.com/p/phantomjs/wiki/Installation) (PhantomJS wiki)

Note that the `phantomjs` executable needs to be in the system `PATH` for grunt to see it.

* [How to set the path and environment variables in Windows](http://www.computerhope.com/issues/ch000549.htm)
* [Where does $PATH get set in OS X 10.6 Snow Leopard?](http://superuser.com/questions/69130/where-does-path-get-set-in-os-x-10-6-snow-leopard)
* [How do I change the PATH variable in Linux](https://www.google.com/search?q=How+do+I+change+the+PATH+variable+in+Linux)

## Why doesn't my asynchronous task complete?
Chances are this is happening because you have forgotten to call the [this.async](api_task.md#thisasync--grunttaskcurrentasync) method to tell grunt that your task is asynchronous. For simplicity's sake, grunt uses a synchronous coding style, which can be switched to asynchronous by calling `this.async()` within the task body.

Note that passing `false` to the `done()` function tells grunt that the task has failed.

For example:

```javascript
grunt.registerTask('asyncme', 'My asynchronous task.', function() {
  var done = this.async();
  doSomethingAsync(done);
});
```
