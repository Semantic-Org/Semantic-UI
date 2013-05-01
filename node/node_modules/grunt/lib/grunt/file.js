/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

var grunt = require('../grunt');

// Nodejs libs.
var fs = require('fs');
var path = require('path');
// In Nodejs 0.8.0, existsSync moved from path -> fs.
var existsSync = fs.existsSync || path.existsSync;

// The module to be exported.
var file = module.exports = {};

// External libs.
file.glob = require('glob-whatev');
file.findup = require('../util/findup');

// Change the current base path (ie, CWD) to the specified path.
file.setBase = function() {
  var dirpath = path.join.apply(path, arguments);
  process.chdir(dirpath);
};

// Match a filepath against one or more wildcard patterns. Returns true if
// any of the patterns match.
file.isMatch = function(patterns, filepath) {
  patterns = Array.isArray(patterns) ? patterns : [patterns];
  return patterns.some(function(pattern) {
    return file.glob.minimatch(filepath, pattern, {matchBase: true});
  });
};

// Return an array of all file paths that match the given wildcard patterns.
file.expand = function() {
  var args = grunt.utils.toArray(arguments);
  // If the first argument is an options object, save those options to pass
  // into the file.glob.glob method for minimatch to use.
  var options = grunt.utils.kindOf(args[0]) === 'object' ? args.shift() : {};
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(args[0]) ? args[0] : args;
  // Generate a should-be-unique number.
  var uid = +new Date();
  // Return a flattened, uniqued array of matching file paths.
  return grunt.utils._(patterns).chain().flatten().map(function(pattern) {
    // If pattern is a template, process it accordingly.
    pattern = grunt.template.process(pattern);
    // Just return the pattern if it's an internal directive.
    if (grunt.task.getDirectiveParts(pattern)) { return pattern; }
    // Otherwise, expand paths.
    return file.glob.glob(pattern, options);
  }).flatten().uniq(false, function(filepath) {
    // Only unique file paths, but don't unique <something> directives, in case
    // they are repeated intentionally.
    return grunt.task.getDirectiveParts(filepath) ? ++uid : filepath;
  }).value();
};

// Further filter file.expand.
function expandByType(type) {
  var args = grunt.utils.toArray(arguments).slice(1);
  return file.expand.apply(file, args).filter(function(filepath) {
    // Just return the filepath if it's an internal directive.
    if (grunt.task.getDirectiveParts(filepath)) { return filepath; }
    try {
      return fs.statSync(filepath)[type]();
    } catch(e) {
      throw grunt.task.taskError(e.message, e);
    }
  });
}

// A few type-specific file expansion methods.
file.expandDirs = expandByType.bind(file, 'isDirectory');
file.expandFiles = expandByType.bind(file, 'isFile');

// Return an array of all file paths that match the given wildcard patterns,
// plus any URLs that were passed at the end.
file.expandFileURLs = function() {
  // Use the first argument if it's an Array, otherwise convert the arguments
  // object to an array and use that.
  var patterns = Array.isArray(arguments[0]) ? arguments[0] : grunt.utils.toArray(arguments);
  var urls = [];
  // Filter all URLs out of patterns list and store them in a separate array.
  patterns = patterns.filter(function(pattern) {
    if (/^(?:file|https?):\/\//i.test(pattern)) {
      // Push onto urls array.
      urls.push(pattern);
      // Remove from patterns array.
      return false;
    }
    // Otherwise, keep pattern.
    return true;
  });
  // Return expanded filepaths with urls at end.
  return file.expandFiles(patterns).map(function(filepath) {
    var abspath = path.resolve(filepath);
    // Convert C:\foo\bar style paths to /C:/foo/bar.
    if (abspath.indexOf('/') !== 0) {
      abspath = ('/' + abspath).replace(/\\/g, '/');
    }
    return 'file://' + abspath;
  }).concat(urls);
};

// Like mkdir -p. Create a directory and any intermediary directories.
file.mkdir = function(dirpath) {
  if (grunt.option('no-write')) { return; }
  dirpath.split(/[\/\\]/).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!existsSync(subpath)) {
      try {
        fs.mkdirSync(subpath, '0755');
      } catch(e) {
        throw grunt.task.taskError('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }, '');
};

// Recurse into a directory, executing callback for each file.
file.recurse = function recurse(rootdir, callback, subdir) {
  var abspath = subdir ? path.join(rootdir, subdir) : rootdir;
  fs.readdirSync(abspath).forEach(function(filename) {
    var filepath = path.join(abspath, filename);
    if (fs.statSync(filepath).isDirectory()) {
      recurse(rootdir, callback, path.join(subdir, filename));
    } else {
      callback(path.join(rootdir, subdir, filename), rootdir, subdir, filename);
    }
  });
};

// Is a given file path absolute?
file.isPathAbsolute = function() {
  var filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === filepath;
};

// Write a file.
file.write = function(filepath, contents) {
  var nowrite = grunt.option('no-write');
  grunt.verbose.write((nowrite ? 'Not actually writing ' : 'Writing ') + filepath + '...');
  // Create path, if necessary.
  file.mkdir(path.dirname(filepath));
  try {
    if (!nowrite) {
      // Actually write file.
      fs.writeFileSync(filepath, contents);
    }
    grunt.verbose.ok();
    return true;
  } catch(e) {
    grunt.verbose.error();
    throw grunt.task.taskError('Unable to write "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

// Read a file, return its contents.
file.read = function(filepath, encoding) {
  var src;
  grunt.verbose.write('Reading ' + filepath + '...');
  try {
    src = fs.readFileSync(String(filepath), encoding ? null : 'utf8');
    grunt.verbose.ok();
    return src;
  } catch(e) {
    grunt.verbose.error();
    throw grunt.task.taskError('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

// Read a file, optionally processing its content, then write the output.
file.copy = function(srcpath, destpath, options) {
  if (!options) { options = {}; }
  var src = file.read(srcpath, true);
  if (options.process && options.noProcess !== true &&
    !(options.noProcess && file.isMatch(options.noProcess, srcpath))) {
    grunt.verbose.write('Processing source...');
    try {
      src = options.process(src.toString('utf8'));
      grunt.verbose.ok();
    } catch(e) {
      grunt.verbose.error();
      throw grunt.task.taskError('Error while processing "' + srcpath + '" file.', e);
    }
  }
  // Abort copy if the process function returns false.
  if (src === false) {
    grunt.verbose.writeln('Write aborted.');
  } else {
    file.write(destpath, src);
  }
};

// Read a file, parse its contents, return an object.
file.readJSON = function(filepath) {
  var src = this.read(String(filepath));
  var result;
  grunt.verbose.write('Parsing ' + filepath + '...');
  try {
    result = JSON.parse(src);
    grunt.verbose.ok();
    return result;
  } catch(e) {
    grunt.verbose.error();
    throw grunt.task.taskError('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
  }
};

// Clear the require cache for all passed filepaths.
file.clearRequireCache = function() {
  // If a non-string argument is passed, it's an array of filepaths, otherwise
  // each filepath is passed individually.
  var filepaths = typeof arguments[0] !== 'string' ? arguments[0] : grunt.utils.toArray(arguments);
  // For each filepath, clear the require cache, if necessary.
  filepaths.forEach(function(filepath) {
    var abspath = path.resolve(filepath);
    if (require.cache[abspath]) {
      grunt.verbose.write('Clearing require cache for "' + filepath + '" file...').ok();
      delete require.cache[abspath];
    }
  });
};

// Access files in the user's ".grunt" folder.
file.userDir = function() {
  var dirpath = path.join.apply(path, arguments);
  var win32 = process.platform === 'win32';
  var homepath = process.env[win32 ? 'USERPROFILE' : 'HOME'];
  dirpath = path.resolve(homepath, '.grunt', dirpath);
  return existsSync(dirpath) ? dirpath : null;
};
