
var fs = require('fs');

// Collectable Mixin
//
// Provides utility methods to read from stdin and remaining arguments.
var collectable = module.exports;

// XXX: tomdocify, generate in readme

collectable.stdin = function stdin(force, done) {
  if(!done) done = force, force = false;
  var argv = this.nopt.argv;
  var self = this;
  done = done || function(err) { err && self.emit('error', err); };

  this._readFromStdin = true;

  // not parsed, register done to be read when parse is called
  if(!argv) {
    this.once('stdin', done);
    return this;
  }

  // only read from stdin when no reamining args and not forced
  if(!argv.remain.length || force) {
    this.readStdin(done);
  }

  return this;
};

// Read files from remaining args, concat the result and call back the `done`
// function with the concatanated result and the list of files.
collectable.files = function files(done) {
  var argv = this.nopt.argv;
  var self = this;
  done = done || function(err) { err && self.emit('error', err); };

  // not parsed, register done to be read when parse is called
  if(!argv) {
    this.once('files', done);
    return this;
  }

  // only read files when we actually have files to read from
  if(argv.remain.length) {
    this.readFiles(argv.remain, done);
  }

  return this;
};

collectable.readStdin = function readStdin(done) {
  var data = '';
  var self = this;
  process.stdin.setEncoding('utf8');
  process.stdin.on('error', done);
  process.stdin.on('data', function(chunk){
    data += chunk;
    self.emit('stdin:data', chunk);
  }).on('end', function(){
    self.emit('stdin', null, data);
    done(null, data);
  }).resume();
  return this;
};

// Asynchronous walk of the remaining args, reading the content and returns
// the concatanated result.
collectable.readFiles = function readFiles(filepaths, done) {
  var data = '';
  var self = this;
  var files = filepaths.slice(0);
  (function read(file) {
    if(!file) {
      self.emit('files', null, data, filepaths);
      return done(null, data, filepaths);
    }
    fs.readFile(file, 'utf8', function(err, body) {
      if(err) return done(err);
      data += body;
      self.emit('files:data', body);
      read(files.shift());
    });
  })(files.shift());
  return this;
};

// Collect data either from stdin or the list of remaining args
collectable.collect = function collect(done) {
  return this.stdin(done).files(done);
};

