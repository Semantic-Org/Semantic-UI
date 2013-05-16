# grunt-lib-contrib [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-lib-contrib.png?branch=master)](http://travis-ci.org/gruntjs/grunt-lib-contrib)

> Common functionality shared across grunt-contrib tasks.

The purpose of grunt-lib-contrib is to explore solutions to common problems task writers encounter, and to ease the upgrade path for contrib tasks.

**These APIs should be considered highly unstable. Depend on them at your own risk!**

_Over time, some of the functionality provided here may be incorporated directly into grunt for mainstream use. Until then, you may require `grunt-lib-contrib` as a dependency in your projects, but be very careful to specify an exact version number instead of a range, as backwards-incompatible changes are likely to be introduced._

### Helper Functions

#### getNamespaceDeclaration(ns)

This helper is used to build JS namespace declarations.

#### optsToArgs(options)

Convert an object to an array of CLI arguments, which can be used with `child_process.spawn()`.

```js
// Example
{
  fooBar: 'a',        // ['--foo-bar', 'a']
  fooBar: 1,          // ['--foo-bar', '1']
  fooBar: true,       // ['--foo-bar']
  fooBar: false,      //
  fooBar: ['a', 'b']  // ['--foo-bar', 'a', '--foo-bar', 'b']
}
```

#### stripPath(pth, strip)

Strip a path from a path. normalize both paths for best results.

#### minMaxInfo(min, max, report)

Helper for logging compressed, uncompressed and gzipped sizes of strings.

#### report
Choices: `false`, `'min'`, `'gzip'`
Default: `false`

Either do not report anything, report only minification result, or report minification and gzip results.

**Important** Including `'gzip'` results can make this task 5-10x slower depending on the size of the file.


```js
var max = grunt.file.read('max.js');
var min = minify(max);
minMaxInfo(min, max, 'gzip');
```

Would print:

```
Original: 495 bytes.
Minified: 396 bytes.
Gzipped: 36 bytes.
```

--

*Lib submitted by [Tyler Kellen](https://goingslowly.com/).*