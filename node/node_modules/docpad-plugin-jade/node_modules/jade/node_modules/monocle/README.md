[![Build Status](https://travis-ci.org/samccone/monocle.png?branch=master)](https://travis-ci.org/samccone/monocle)

# Monocle -- a tool for watching things

[![logo](https://raw.github.com/samccone/monocle/master/logo.png)](https://raw.github.com/samccone/monocle/master/logo.png)

Have you ever wanted to watch a folder and all of its files/nested folders for changes. well now you can!

## Installation

```
npm install monocle
```

## Usage

### Watch a directory:

```js
var monocle = require('monocle')()
monocle.watchDirectory({
  root: <root directory>,
  fileFilter: <optional>,
  directoryFilter: <optional>,
  listener: fn(fs.stat+ object), //triggered on file change / addition
  complete: <fn> //file watching all set up
});
```

The listener will recive an object with the following

```js
  name: <filename>,
  path: <filepath-relative>,
  fullPath: <filepath-absolute>,
  parentDir: <parentDir-relative>,
  fullParentDir: <parentDir-absolute>,
  stat: <see fs.stats>
```

[fs.stats](http://nodejs.org/api/fs.html#fs_class_fs_stats)

When a new file is added to the directoy it triggers a file change and thus will be passed to your specified listener.

The two filters are passed through to `readdirp`.  More documentation can be found [here](https://github.com/thlorenz/readdirp#filters)

### Watch a list of files:

```js
Monocle.watchFiles({
  files: [], //path of file(s)
  listener: <fn(fs.stat+ object)>, //triggered on file / addition
  complete: <fn> //file watching all set up
});
```

## Why not just use fs.watch ?

  - file watching is really bad cross platforms in node
  - you need to be smart when using fs.watch as compared to fs.watchFile
  - Monocle takes care of this logic for you!
  - windows systems use fs.watch
  - osx and linux uses fs.watchFile

## License

BSD
