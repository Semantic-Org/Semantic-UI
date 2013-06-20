var path = require('path');
var fs = require('fs');
var assert = require("assert");

// file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
// 
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
// @callback: called when finished.
exports.mkdirs = function (_path, mode, callback) {
  _path = exports.path.abspath(_path);

  var dirs = _path.split("/");
  var walker = [dirs.shift()];

  // walk
  // @ds:  A list of directory names
  // @acc: An accumulator of walked dirs
  // @m:   The mode
  // @cb:  The callback
  var walk = function (ds, acc, m, cb) {
    if (ds.length > 0) {
      var d = ds.shift();

      acc.push(d);
      var dir = acc.join("/");

      // look for dir on the fs, if it doesn't exist then create it, and 
      // continue our walk, otherwise if it's a file, we have a name
      // collision, so exit.
      fs.stat(dir, function (err, stat) {
        // if the directory doesn't exist then create it
        if (err) {
          // 2 means it's wasn't there
          if (err.errno == 2 || err.errno == 34) {
            fs.mkdir(dir, m, function (erro) {
              if (erro && erro.errno != 17 && erro.errno != 34) {
                return cb(erro);
              } else {
                return walk(ds, acc, m, cb);
              }
            });
          } else {
            return cb(err);
          }
        } else {
          if (stat.isDirectory()) {
            return walk(ds, acc, m, cb);
          } else {
            return cb(new Error("Failed to mkdir " + dir + ": File exists\n"));
          }
        }
      });
    } else {
      return cb();
    }
  };
  return walk(dirs, walker, mode, callback);
};

// file.mkdirsSync
//
// Synchronus version of file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
// 
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
exports.mkdirsSync = function (_path, mode) {
  if (_path[0] !== "/") {
    _path = path.join(process.cwd(), _path)
  }

  var dirs = _path.split("/");
  var walker = [dirs.shift()];

  dirs.reduce(function (acc, d) {
    acc.push(d);
    var dir = acc.join("/");
    
    try {
      var stat = fs.statSync(dir);
      if (!stat.isDirectory()) {
        throw "Failed to mkdir " + dir + ": File exists";
      }
    } catch (err) {
      fs.mkdirSync(dir, mode);
    }
    return acc;
  }, walker);
};

// file.walk
//
// Given a path to a directory, walk the fs below that directory
// 
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walk = function (start, callback) {
  fs.lstat(start, function (err, stat) {
    if (err) { return callback(err) }
    if (stat.isDirectory()) {

      fs.readdir(start, function (err, files) {
        var coll = files.reduce(function (acc, i) {
          var abspath = path.join(start, i);

          if (fs.statSync(abspath).isDirectory()) {
            exports.walk(abspath, callback);
            acc.dirs.push(abspath);
          } else {
            acc.names.push(abspath);
          }

          return acc;
        }, {"names": [], "dirs": []});

        return callback(null, start, coll.dirs, coll.names);
      });
    } else {
      return callback(new Error("path: " + start + " is not a directory"));
    }
  });
};

// file.walkSync
//
// Synchronus version of file.walk
//
// Given a path to a directory, walk the fs below that directory
// 
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walkSync = function (start, callback) {
  var stat = fs.statSync(start);

  if (stat.isDirectory()) {
    var filenames = fs.readdirSync(start);

    var coll = filenames.reduce(function (acc, name) {
      var abspath = path.join(start, name);

      if (fs.statSync(abspath).isDirectory()) {
        acc.dirs.push(name);
      } else {
        acc.names.push(name);
      }

      return acc;
    }, {"names": [], "dirs": []});

    callback(start, coll.dirs, coll.names);

    coll.dirs.forEach(function (d) {
      var abspath = path.join(start, d);
      exports.walkSync(abspath, callback);
    });

  } else {
    throw new Error("path: " + start + " is not a directory");
  }
};

exports.path = {};

exports.path.abspath = function (to) {
  var from;
  switch (to.charAt(0)) {
    case "~": from = process.env.HOME; to = to.substr(1); break
    case "/": from = ""; break
    default : from = process.cwd(); break
  }
  return path.join(from, to);
}

exports.path.relativePath = function (base, compare) {
  base = base.split("/");
  compare = compare.split("/");

  if (base[0] == "") {
    base.shift();
  }

  if (compare[0] == "") {
    compare.shift();
  }

  var l = compare.length;

  for (var i = 0; i < l; i++) {
    if (!base[i] || (base[i] != compare[i])) {
      return compare.slice(i).join("/");
    }
  }

  return ""
};

exports.path.join = function (head, tail) {
  if (head == "") {
    return tail;
  } else {
    return path.join(head, tail);
  }
};

