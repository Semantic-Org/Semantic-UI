'use strict';

module.exports = Entry;

var PassThrough = require('stream').PassThrough;
var inherits = require('util').inherits;

if (!PassThrough) {
  PassThrough = require('readable-stream/passthrough');
}

inherits(Entry, PassThrough);

function Entry () {
  PassThrough.call(this);
  this.props = {};
}

Entry.prototype.autodrain = function () {
  this.on('readable', this.read.bind(this));
};
