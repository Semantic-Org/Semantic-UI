BOWER [![Build Status](https://secure.travis-ci.org/twitter/bower.png)](http://travis-ci.org/twitter/bower)
=====

### Introduction

Bower is a package manager for the web. Bower lets you easily install assets such as images, CSS and JavaScript, and manages dependencies for you.

For example, to install a package, run:

    bower install jquery

This will download jQuery to `./components/jquery`. That's it. The idea is that Bower does package management and package management only.

### Installing Bower

Bower is installed using [Node](http://nodejs.org/) and [npm](http://npmjs.org/) (oh my, how meta).

    npm install bower -g

### Usage

Your best friend at this stage is probably `bower --help`.

To install a package:

    bower install jquery
    bower install git://github.com/components/jquery.git
    bower install components/jquery (same as above)
    bower install http://foo.com/jquery.awesome-plugin.js
    bower install ./repos/jquery

As you can see, packages can be installed by name, Git endpoint, GitHub shorthand, URL or local path.
If you install from a URL that points to a zip or tar file, bower will automatically extract its contents.
When tags are available in the endpoint, you can specify a [semver](http://semver.org/) tag to fetch concrete versions:

    bower install jquery#1.8.1
    bower install git://github.com/components/jquery.git#~1.8.1
    bower install components/jquery#1.8.x

Bower also works with private Git repositories. Simply reference them by their SSH endpoint:

    bower install git@github.com:user/private-package.git

[View all packages available through Bower's registry](http://sindresorhus.com/bower-components/).

During install you can have Bower add an entry to your component.json as well:

    bower install --save jquery

To update a package, reference it by name:

    bower update jquery-ui

To list installed packages:

    bower list

To search for packages:

    bower search [name]

To list all the available packages, just call `bower search` without specifying a name.

To clean the cache:

    bower cache-clean [name]

Several packages can be cleaned at the same time.
To clean the entire cache, just call `bower cache-clean` without any names.
Also, both the install and update commands have a `--force` flag that tells bower to bypass the cache and always fetch remote sources.

You can disable colors by using the `--no-color` flag.

### Bower Configuration

Bower can be configured by creating a .bowerrc file in your home folder (usually ~/.bowerrc) with one or all of the following configuration parameters. You can also configure Bower on a per-project basis by creating a .bowerrc file in the project directory, Bower will merge this configuration with the configuration found in your home directory. This allows you to version your project specific Bower configuration with the rest of your code base.

```json
{
  "directory" : "components",
  "json"      : "component.json",
  "endpoint"  : "https://bower.herokuapp.com"
}
```

To run your own Bower Endpoint for custom components/packages that are behind a firewall you can use a simple implementation of bower server at https://github.com/twitter/bower-server.

The __searchpath__ array provides additional URLs of read-only Bower registries that should be consulted to look up components.  This is most typically used if your business wishes to
house some components internally while still taking advantage of public Bower registries.  For example, you might configure the following:

```json
{
  "directory"  : "components",
  "json"       : "component.json",
  "endpoint"   : "http://bower.mycompany.com",
  "searchpath" : ["https://bower.herokuapp.com"]
}
```

Bower will first look to **http://bower.mycompany.com** while trying to find your components.  If not found, the main registry at **https://bower.herokuapp.com** will be consulted to see if a copy of the resource can be retrieved.


### Defining a package

You can create a `component.json` file in your project's root, specifying all of its dependencies. This is similar to Node's `package.json`, or Ruby's `Gemfile`, and is useful for locking down a project's dependencies.

```json
{
  "name": "myProject",
  "version": "1.0.0",
  "main": "./path/to/main.css",
  "dependencies": {
    "jquery": "~1.7.2"
  }
}
```

Put this under your project's root, listing all of your dependencies. When you run `bower install`, Bower will read this `component.json` file, resolve all the relevant dependencies and install them.

For now, `name`, `version`, `main`, `dependencies`, `devDependencies`, and `ignore` are the only properties that are used by Bower. If you have several files you're distributing as part of your package, pass an array to `main` like this:

```json
{
  "name": "myProject",
  "version": "1.0.0",
  "main": ["./path/to/app.css", "./path/to/app.js", "./path/to/sprite.img"],
  "dependencies": {
    "jquery": "~1.7.2"
  }
}
```

Bower only recognizes versions that follow the [semver](http://semver.org/) specification.
There should only be at most one file per file type in the `main` list. So only one `.js` or `.css`.

You can also point to packages by adding their URL or file path in the dependency's property.

```json
{
  "dependencies": {
    "eventEmitter": "Wolfy87/EventEmitter", // GitHub short URL
    "eventEmitter": "Wolfy87/EventEmitter#>=3", // with version
    "eventEmitter": "git://github.com/Wolfy87/EventEmitter",
    "eventEmitter": "git@github.com:Wolfy87/EventEmitter.git"
  }
}
```

Chances are you have a bunch of extra stuff in the repo that are not needed in production. List these non-necessary file paths in `ignore`.

```json
{
  "ignore": [
    "tests/",
    "**/*.txt"
  ]
}
```

You may add non-essential packages in `devDependencies`. This is useful for packages aren't required to support the package, but that are used in your project, i.e. to build documentation, run a demo, or run tests.

```json
{
  "devDependencies": [
    "qunit": "~1"
  ]
}
```

### Installing dependencies

Dependencies are installed locally via the `bower install` command. First they’re resolved to find conflicts. Then they’re downloaded and unpacked in a local subdirectory called `./components`, for example:


```
/component.json
/components/jquery/index.js
/components/jquery/component.json
```

You can also install packages one at a time `bower install git://my/git/thing`

There are no system wide dependencies, no dependencies are shared between different apps, and the dependency tree is flat.

### Deploying

The easiest approach is to use Bower statically, just reference the packages manually from a script tag:

    <script src="components/jquery/index.js"></script>

For more complex projects, you'll probably want to concatenate your scripts. Bower is just a package manager, but there are lots of awesome libraries out there to help you do this, such as [Sprockets](https://github.com/sstephenson/sprockets) and [RequireJS](http://requirejs.org/).

For example, to use Sprockets:

```ruby
environment = Sprockets::Environment.new
environment.append_path 'components'
environment.append_path 'public'
run environment
```

### Package Consumption

Bower also makes available a source mapping – this can be used by build tools to easily consume Bower components.

If you pass the option `--map` to bower's `list` command, it will generate a JSON with dependency objects. Alternatively, you can pass the `--paths` flag to the `list` command to get a simple path to name mapping:

```json
{
  "backbone": "components/backbone/index.js",
  "jquery": "components/jquery/index.js",
  "underscore": "components/underscore/index.js"
}
```

### Authoring packages

To register a new package, it's as simple as specifying a `component.json`, pushing the package to a Git endpoint, say GitHub, and running:

    bower register myawesomepackagename git://github.com/maccmans/face

There's no authentication or user management. It's on a first come, first served basis. Think of it like a URL shortener. Now anyone can run `bower install myawesomepackagename`, and get your library installed.

There is no direct way to unregister a package yet. Meanwhile you can request it [here](https://github.com/twitter/bower/issues/120).

### Philosophy

Currently, people are managing dependencies, such as JavaScript libraries, manually. This sucks, and we want to change it.

In a nutshell, Bower is a generic tool which will resolve dependencies and lock packages down to a version. It runs over Git, and is package-agnostic. A package may contain JavaScript, CSS, images, etc., and doesn't rely on any particular transport (AMD, CommonJS, etc.).

Bower then makes available a simple programmatic API which exposes the package dependency model, so that existing build tools (like Sprockets, LoadBuilder, curls.js, Ender, etc.) can consume it and build files accordingly.


### Programmatic API

Bower provides a pretty powerful programmatic api. All commands can be accessed through the `bower.commands` object.

```js
var bower = require('bower');

bower.commands
  .install(paths, options)
  .on('end', function (data) {
    data && console.log(data);
  });

bower.commands
  .search('jquery', {})
  .on('packages', function(packages) {
    /* `packages` is a list of packages returned by searching for 'jquery' */
  });
  
```

Commands emit four types of events: `data`, `end`, `result`, and `error`. `error` will only be emitted if something goes wrong. Not all commands emit all events; for a detailed look, check out the code in `lib/commands`. `data` is typically a colorized string, ready to show to an end user. `search` and `lookup` emit `packages` and `package`, respectively. Those events contain a json representation of the result of the command.

For a better of idea how this works, you may want to check out [our bin file](https://github.com/twitter/bower/blob/master/bin/bower).

For the install command, there is an additional `package` event that is emitted for each installed/uninstalled package.


### Completion

**experimental**

Based on the completion feature and fantastic work done in
[npm](https://npmjs.org/doc/completion.html), Bower now has an experimental
`completion` command that works similarly.

This command will output a Bash / ZSH script to put into your `~/.bashrc`, `~/.bash_profile` or `~/.zshrc` file.

```
bower completion >> ~/.bash_profile
```

*This doesn't work for Windows user, even with Cygwin.*


### Windows users

A lot of people are experiencing problems using bower on windows because [msysgit](http://code.google.com/p/msysgit/) must be installed correctly.
Be sure to check the option shown above, otherwise it will simply not work:

![msysgit](http://f.cl.ly/items/2V2O3i1p3R2F1r2v0a12/mysgit.png)


### FAQ

**What distinguishes Bower from Jam, Volo or Ender? What does it do better?**

Bower is a lower level component than Jam, Volo, or Ender. These managers could consume Bower as a dependency.

Bower's aim is simply to install Git paths, resolve dependencies from a `component.json`, check versions, and then provide an API which reports on these things. Nothing more. This is a major diversion from past attempts at browser package management.

Bower is working under the assumption that there is a single, common problem in frontend application development: dependency resolution. Past attempts (Jam, Volo, Ender) try to tackle this problem in such a way that they actually end up alienating and further segregating the JavaScript community around transports (Sprockets, CommonJS, RequireJS, regular script tags).

Bower offers a generic, unopinionated solution to the problem of package management, while exposing an API that can be consumed by a more opinionated build stack.

**Volo is an arguably more established project and works with the GitHub search API. Will it take long for Bower to contain a decent number of packages?**

Bower (being a Git powered package manager) should, in theory, be capable of consuming every package that Volo does, with the additional benefit of supporting internal networks and other Git repositories not hosted on GitHub.

**We recently saw what happened when the main NPM registry went down. Is a single point of failure possible for Bower and if so, do you have redundancy planned?**

There's no redundancy planned at the moment, as Bower just installs Git URLs. It's up to the URL provider to establish redundancy.

**Isn't having a `package.json` file going to conflict with my npm's `package.json`? Will this be a problem?**

Don't use a `package.json` – use a `component.json`.

**Bower is an open-source Twitter project. How well can we expect it to be maintained in the future?**

Twitter is in the process of migrating its frontend architecture onto Bower, so it's fairly safe to say it will be maintained and invested in going forward.


### Contact

Have a question?

- [StackOverflow](http://stackoverflow.com/questions/tagged/bower)
- [Mailinglist](http://groups.google.com/group/twitter-bower) - twitter-bower@googlegroups.com
- [\#bower](http://webchat.freenode.net/?channels=bower) on Freenode


### Authors

+ [@fat](http://github.com/fat)
+ [@maccman](http://github.com/maccman)
+ [@satazor](http://github.com/satazor)

Thanks for assistance and contributions:

+ [@addyosmani](http://github.com/addyosmani)
+ [@angus-c](http://github.com/angus-c)
+ [@borismus](http://github.com/borismus)
+ [@chriseppstein](http://github.com/chriseppstein)
+ [@danwrong](http://github.com/danwrong)
+ [@desandro](http://github.com/desandro)
+ [@isaacs](http://github.com/isaacs)
+ [@josh](http://github.com/josh)
+ [@jrburke](http://github.com/jrburke)
+ [@mklabs](http://github.com/mklabs)
+ [@paulirish](http://github.com/paulirish)
+ [@rvagg](http://github.com/rvagg)
+ [@sindresorhus](http://github.com/sindresorhus)
+ [@SlexAxton](http://github.com/SlexAxton)
+ [@sstephenson](http://github.com/sstephenson)
+ [@tomdale](http://github.com/tomdale)
+ [@uzquiano](http://github.com/uzquiano)
+ [@visionmedia](http://github.com/visionmedia)
+ [@wagenet](http://github.com/wagenet)
+ [@wycats](http://github.com/wycats)
+ [@sindresorhus](http://github.com/sindresorhus)
+ [@hemanth](http://github.com/hemanth)
+ [@wibblymat](http://github.com/wibblymat)
+ [@marcelombc](http://github.com/marcelombc)

## License

Copyright 2012 Twitter, Inc.

Licensed under the MIT License
