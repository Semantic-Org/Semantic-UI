'use strict';

module.exports = Match;

var Transform = require('stream').Transform;
var inherits = require("util").inherits;
var Buffers = require('buffers');

if (!Transform) {
  Transform = require('readable-stream/transform');
}

inherits(Match, Transform);

function Match(opts, matchFn) {
  if (!(this instanceof Match)) {
    return new Match(opts, matchFn);
  }

  //todo - better handle opts e.g. pattern.length can't be > highWaterMark
  this._opts = opts;
  if (typeof this._opts.pattern === "string") {
    this._opts.pattern = new Buffer(this._opts.pattern);
  }
  this._matchFn = matchFn;
  this._bufs = Buffers();

  Transform.call(this);
}

Match.prototype._transform = function (chunk, encoding, callback) {
  var pattern = this._opts.pattern;
  this._bufs.push(chunk);

  var index = this._bufs.indexOf(pattern);
  if (index >= 0) {
    processMatches.call(this, index, pattern, callback);
  } else {
    this._matchFn(this._bufs.splice(0, this._bufs.length - chunk.length));
    callback();
  }
};

function processMatches(index, pattern, callback) {
  var buf = this._bufs.splice(0, index).toBuffer();
  if (this._opts.consume) {
    this._bufs.splice(0, pattern.length);
  }
  this._matchFn(buf, pattern, this._bufs.toBuffer());

  index = this._bufs.indexOf(pattern);
  if (index > 0 || this._opts.consume && index === 0) {
    process.nextTick(processMatches.bind(this, index, pattern, callback));
  } else {
    callback();
  }
}
