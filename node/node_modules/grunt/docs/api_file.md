[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# [The grunt API](api.md) / grunt.file

Wildcard expansion, file reading, writing, directory traversing.

See the [file lib source](../lib/grunt/file.js) for more information.

## The file API
There are many provided methods for reading and writing files, as well as traversing the filesystem and finding files by wildcard patterns. Many of these methods are wrappers around core Node.js file functionality, but with additional error handling and logging.

_Note: all file paths are relative to the [grunt.js gruntfile](getting_started.md) unless the current working directory is changed with `grunt.file.setBase` or the `--base` command-line option._

### grunt.file.read
Read and return a file's contents. The `encoding` argument defaults to `utf8` if unspecified.

```javascript
grunt.file.read(filepath, encoding)
```

### grunt.file.readJSON
Read a file's contents, parsing the data as JSON and returning the result.

```javascript
grunt.file.readJSON(filepath)
```

### grunt.file.write
Write the specified contents to a file, creating intermediate directories if necessary.

_If the `--no-write` command-line option is specified, the file won't actually be written._

```javascript
grunt.file.write(filepath, contents)
```

### grunt.file.copy
Copy a source file to a destination path, creating intermediate directories if necessary.

_If the `--no-write` command-line option is specified, the file won't actually be written._

```javascript
grunt.file.copy(srcpath, destpath [, options])
```

The `options` object has these possible properties:

```javascript
var options = {
  // If specified, the file contents will be parsed as `utf8` and passed into
  // the function, whose return value will be used as the destination file's
  // contents. If this function returns false, the file copy will be aborted.
  process: processFunction,
  // These optional wildcard patterns will be matched against the filepath using
  // grunt.file.isMatch. If a specified wildcard pattern matches, the file will
  // not be processed via `processFunction`. Note that `true` may also be
  // specified to prvent processing.
  noProcess: wildcardPatterns
};
```

### grunt.file.mkdir
Works like `mkdir -p`. Create a directory along with any intermediate directories.

_If the `--no-write` command-line option is specified, directories won't actually be created._

```javascript
grunt.file.mkdir(dirpath)
```

### grunt.file.recurse
Recurse into a directory, executing `callback` for each file.

```javascript
grunt.file.recurse(rootdir, callback)
```

The callback function receives the following arguments:

```javascript
function callback(abspath, rootdir, subdir, filename) {
  // The full path to the current file, which is nothing more than
  // the rootdir + subdir + filename arguments, joined.
  abspath
  // The root director, as originally specified.
  rootdir
  // The current file's directory, relative to rootdir.
  subdir
  // The filename of the current file, without any directory parts.
  filename
}
```

### grunt.file.findup
Search for a filename in the given directory followed by all parent directories. Returns the first matching filepath found, otherwise returns `null`.

```javascript
grunt.file.findup(rootdir, filename)
```

### grunt.file.isPathAbsolute
Is a given file path absolute? Returns a boolean.

Like the Node.js [path.join](http://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method, this method will join all arguments together and normalize the resulting path.

```javascript
grunt.file.isPathAbsolute(path1 [, path2 [, ...]])
```

### grunt.file.userDir
Return a file path relative to the user's `.grunt` directory, which is `%USERPROFILE%\.grunt\` on Windows, and `~/.grunt/` on OS X or Linux. If no file path is specified, the base user `.grunt` directory path will be returned. If the specified path is not found, `null` is returned.

Windows users: `%USERPROFILE%` is generally your `Documents and Settings` directory.

_Like the Node.js [path.join](http://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method, this method will join all arguments together and normalize the resulting path._

```javascript
grunt.file.userDir([path1, [, path2 [, ...]]])
```

### grunt.file.setBase
Change grunt's current working directory. By default, all file paths are relative to the [grunt.js gruntfile](getting_started.md). This works just like the `--base` command-line option.

```javascript
grunt.file.setBase(path1 [, path2 [, ...]])
```

Like the Node.js [path.join](http://nodejs.org/docs/latest/api/path.html#path_path_join_path1_path2) method, this method will join all arguments together and normalize the resulting path.


## File Lists and Wildcards
Wildcard patterns are resolved using the [glob-whatev library](https://github.com/cowboy/node-glob-whatev). See the [minimatch](https://github.com/isaacs/minimatch) module documentation for more details on supported wildcard patterns.

There are also a number of [task-specific file listing methods](api_task.md) that find files inside grunt plugins and task directories.

_Note: all file paths are relative to the [grunt.js gruntfile](getting_started.md) unless the current working directory is changed with `grunt.file.setBase` or the `--base` command-line option._

### grunt.file.expand
Return a unique array of all file or directory paths that match the given wildcard pattern(s). This method accepts one or more comma separated wildcard patterns as well as an array of wildcard patterns.

The `options` object supports all [minimatch](https://github.com/isaacs/minimatch) options.

```javascript
grunt.file.expand([options, ] patterns)
```

### grunt.file.expandDirs
This method behaves the same as `grunt.file.expand` except it only returns directory paths.

```javascript
grunt.file.expandDirs([options, ] patterns)
```

### grunt.file.expandFiles
This method behaves the same as `grunt.file.expand` except it only returns file paths.

```javascript
grunt.file.expandFiles([options, ] patterns)
```

This method is used by many built-in tasks to handle wildcard expansion of the specified source files. See the [concat task source](../tasks/concat.js) for an example.

### grunt.file.expandFileURLs
Return a unique array of all `file://` URLs for files that match the given wildcard pattern(s). Any absolute `file://`, `http://` or `https://` URLs specified will be passed through. This method accepts one or more comma separated wildcard patterns (or URLs), as well as an array of wildcard patterns (or URLs).

```javascript
grunt.file.expandFileURLs(patternsOrURLs)
```

See the [qunit task source](../tasks/qunit.js) for an example.

### grunt.file.isMatch
Match one or more wildcard patterns against a file path. If any of the specified matches, return `true` otherwise return `false`. This method accepts a single string wildcard pattern as well as an array of wildcard patterns. Note that `true` may also be specified to prvent processing.

```javascript
grunt.file.isMatch(patterns, filepath)
```

Patterns without slashes will be matched against the basename of the path if it contains slashes, eg. pattern `*.js` will match filepath `path/to/file.js`.

## External libraries

### grunt.file.glob
[glob-whatev](https://github.com/cowboy/node-glob-whatev) - Synchronous file globbing utility.
