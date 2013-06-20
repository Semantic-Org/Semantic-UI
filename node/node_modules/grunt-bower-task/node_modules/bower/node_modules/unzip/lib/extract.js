'use strict';

module.exports = Extract;

var Parse = require("../unzip").Parse;
var Writer = require("fstream").Writer;
var Writable = require('stream').Writable;
var path = require('path');
var inherits = require('util').inherits;

if (!Writable) {
  Writable = require('readable-stream/writable');
}

inherits(Extract, Writable);

function Extract (opts) {
  var self = this;
  if (!(this instanceof Extract)) {
    return new Extract(opts);
  }

  Writable.apply(this);
  this._opts = opts || { verbose: false };

  this._parser = Parse(this._opts);
  this._parser.on('error', function(err) {
    self.emit('error', err);
  });
  this.on('finish', function() {
    self._parser.end();
  });

  var writer = Writer({
    type: 'Directory',
    path: opts.path
  });
  writer.on('error', function(err) {
    self.emit('error', err);
  });
  writer.on('close', function() {
    self.emit('close')
  });

  this.on('pipe', function(source) {
    if (opts.verbose && source.path) {
      console.log('Archive: ', source.path);
    }
  });

  this._parser.pipe(writer);
}

Extract.prototype._write = function (chunk, encoding, callback) {
  if (this._parser.write(chunk)) {
    return callback();
  }

  return this._parser.once('drain', callback);
};
