# canihaz - supercharged dependency loading and installation
[![build status](https://secure.travis-ci.org/3rd-Eden/canihaz.png)](http://travis-ci.org/3rd-Eden/canihaz)

Canihaz is a module that allows you to lazily install and require NPM modules
that might not be required for the core functionality of your library. This
includes, but is not limited to:

- Optional dependencies
- Dependencies that are only used for your optional CLI interface
- Dependencies that are sparsely used in the application

My use case for this library is a front-end build system that I have been
developing. It's called [square][square] and uses a plugin based system to
process your front-end code such as CSS, JavaScript and all possible
pre-processors. If I wanted to support every CSS pre-processor I would have had
to specify: sass, less and stylus in the dependencies, but nobody is ever going
to use all of them, so 90% of these modules would have been pointless bloat. And
I, personally hate code bloat. It's a disease that spreads exponentially with
every module that is released and dependent upon. So to combat this bloat
I wanted to have a way to lazy load and (silently) install the modules when they
are needed.

[square]: /observing/square

---

## Table of Contents

- [Installation][0]
- [How does it work][1]
- [API][2]
  - [package.json example][2.1]
  - [Configuration][2.2]
  - [Configured dependencies][2.3]
  - [Un-configured dependencies][2.4]
  - [Multiple dependencies][2.5]
- [Changelog][3]
- [License][4]

[0]: #installation "Install all the things"
[1]: #how-does-it-work "it's like magic, unicorns and narwals combined in to awesomness"
[2]: #api "The bits that you can use and configure"
[2.1]: #packagejson-example
[2.2]: #configuration
[2.3]: #installingrequiring-a-configured-dependency
[2.4]: #installingrequiring-a-un-configured-dependency
[2.5]: #installingrequiring-multiple-dependencies
[4]: #license-mit "Stuff"

---

## Installation

This module should be installed using NPM:

```bash
npm install canihaz --save
```

The `--save` parameter tells NPM that it should add it to your package.json, so
less editing for you.

If you do not install it using NPM, make sure that install it in
a `node_modules` folder and do not symlink it.. Unless you don't want to use the
automatic dependency resolution.

---

## How does it work

I always tell people that you should understand how a module works before you
use it, checkout out the source or at least read the damned documentation.

When you initialize the module after you required it it will go up 2 directories
to go out of the `node_modules` folder and attempt to read out the
`package.json` file of the module that depends on canihaz. It requires the
package.json and search for the dependencies, it searches for `canihaz` key by
default but it can be configured. When it found the dependencies, it attaches
the names to the returned object and creates a really simple usable interface
for it:

```js
var canihaz = require('canihaz')(.. config ..);

canihaz.dep(function requireallthethings(err, dep) {
  .. dep is installed if it's not installed before or just required
});
```

It automatically knows which version it should install for you as you specified
that in the object. Installing a dependency that isn't pre-defined in your
`package.json` you could do something similar:

```js
var canihaz = require('canihaz')();

canihaz(dep, version, function lazyloading(err, dep) {
  .. dep is installed with the specified version
});
```

But before it tries to install the module it checks it it's perhaps globally
installed (with the correct version) or if it's already installed before in the
specified location. When all these checks fail, we continue with the
installation. In older version of canihaz we called the NPM api programatically
but there were a couple of issues with this, like install race conditions and it
didn't use the users set configurations. That's why we are currently spawning an
NPM child process. So you need to have NPM installed globally and set in your
path. The added benefit of this is that the installation becomes completely
silent as NPM is usually really chatty and last but not least, it already works
as this module is installed through NPM.

Once it's finally installed it attempts to require it again, if it succeeds it
will call your callback without any error arguments and provide the library in
the callback. If the installation failed or it failed to require you're
basically fucked.

## API

#### package.json example

In the example below, we install canihaz as dependency, and have all our
optional dependencies in the property `canihaz` which will be read out by
module.

```js
{
    "name": "example"
  , "description": "example description"
  , "version": "0.0.0"
  , "dependencies": {
        "canihaz": "0.0.x"
    }
  , "canihaz": {
        "coffee-script": "1.3.3"
      , "csslint": "0.9.8"
      , "jshint": "0.7.1"
      , "socket.io": "0.9.6"
      , "stylus": "0.27.2"
      , "watch": "0.5.1"
    }
}
```

#### configuration

- dot: Should we create a special dot folder for storage? This is saved in
  the home directory of the user. Should be a string.
- home: The location of the home folders, as this is operating system
  specific or you might want to override this if you want to store the dot
  folder in a different location. Should be string.
- location: The location of the package.json that we need to parse and read out
  the possible dependencies for lazy installation.
- key: Which property should we scan for the optional dependencies? This
  allows you to also lazy install optionalDependencies for example.
- installation: The installation location, this is where the dependencies will
  be installed. It defaults to the `package.json` folder.

Example:

```js
var canihaz = require('canihaz')({
    key: 'cliDependencies' // read out `cliDependencies` instead of `canihaz`
});
```

#### installing/requiring a configured dependency

The dependencies that you specify in the `package.json` are automatically
introduced to the returned export. It assumes that it's loaded by the package
that we specified above.

```js
var canihaz = require('canihaz')();

canihaz.jshint(function loading(err, jshint) {
  // jshint is now loaded, unless we got an error
});
```

#### installing/requiring a un-configured dependency

Installing or requiring a dependency that isn't in the `package.json` require
direct usage of the API:

```js
var canihaz = require('canihaz')();

canihaz('jshint', '0.7.x', function lazyloading(err, jsint) {
  // jsint is installed with the specified version
});
```

#### installing/requiring multiple dependencies

Sometimes you just need a load of modules. There are 2 different ways this is
done, if the modules are defined in the `package.json` it will automatically use
their specified function and doesn't require you to specify the version numbers:

```js
var canihaz = require('canihaz')();

canihaz(
    'jshint', 'stylus', 'express'
  , function lazyloading(err, jsint, stylus, express) {
      // the modules are loaded or installed in the same order as the arguments
    }
);
```

If you need to a bunch of modules that are not specified in the package. 

```js
canihaz(
    { name: 'jshint', version: '0.7.x' }
  , { name: 'stylus', version: '' }
  , { name: 'express', version: '3.0.x' }
  , function lazyloading(err, jsint, stylus, express) {
      // the modules are loaded or installed in the same order as the arguments
    }
);
```

---

## Changelog

__1.0.0__ Rewritten to use the `npm` binary for all installations because the
programatically API causes to much issues and edge cases. 1.0.0 also features a
full test suite and a reworked more powerful API.

_all other version were crap anyways_

---

## License (MIT)

Copyright (c) 2013 Arnout Kazemier, 3rd-Eden.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
