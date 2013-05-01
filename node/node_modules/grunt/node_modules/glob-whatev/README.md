# Node Glob, Whatever

A quick and dirty synchronous file globbing utility based on [minimatch](https://github.com/isaacs/minimatch).

## Why another file globbing library?

I wanted to make [grunt](https://github.com/cowboy/grunt) work on Windows. Unfortunately, [node-glob](https://github.com/isaacs/node-glob) doesn't work on Windows, and [miniglob](https://github.com/isaacs/miniglob) isn't synchronous. And this needed to be synchronous.

## Any issues?

This library works with any path that [minimatch](https://github.com/isaacs/minimatch) supports, and is the core of the [grunt](https://github.com/cowboy/grunt) wildcard globbing methods.

To be fair, this library isn't terribly efficient. But that's ok, because it's mainly used with relatively small folder structures. Maybe someone will help improve this library (patches welcome!). Or maybe even write a better library, and then I'll use that instead. But for now, this works just fine.

## Getting Started

First, install the module with: `npm install glob-whatev`

```javascript
var globsync = require('glob-whatev');

// Relative patterns are matched against the current working directory.
globsync.glob('foo/**/*.js').forEach(function(filepath) {
  // do stuff with `filepath`
});

// Basically, it works like this.
globsync.glob(globPattern [, minimatchOptions])

// Also, minimatch is exposed in case you just want to match patterns, eg.
var isJS = globsync.minimatch(file, '*.js', {matchBase: true});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History

* 2012/07/20 - v0.1.8 - Fixed a bug whereby specifying a trailing / in directory names would fail.
* 2012/07/02 - v0.1.7 - No longer warns about path.existsSync in Node 0.8.x.
* 2012/04/13 - v0.1.6 - Added `options.cwd` option to allow searching from a different base directory than `process.cwd()`. Added `options.maxDepth` unit tests.
* 2012/04/10 - v0.1.5 - Fixed an issue where using the `matchBase` minimatch option with simple patterns would fail.
* 2012/03/26 - v0.1.4 - Fixed a minor issue with absolute paths on Windows.
* 2012/03/25 - v0.1.3 - Updated to minimatch 0.2.2+. Minimatch is now exposed as exports.minimatch.
* 2012/02/14 - v0.1.2 - Fixed an issue with nonexistent directories.
* 2012/01/23 - v0.1.1 - Fixed an issue with stat and locked files.
* 2012/01/11 - v0.1.0 - First official release.

## License
Copyright (c) 2012 "Cowboy" Ben Alman  
Licensed under the MIT license.  
<http://benalman.com/about/license/>
