'use strict';

var value = require('./valid-value')

  , forEach = Array.prototype.forEach, slice = Array.prototype.slice
  , keys = Object.keys

  , extend;

extend = function (src) {
	keys(Object(src)).forEach(function (key) {
		this[key] = src[key];
	}, this);
};

module.exports = function (dest/*, …src*/) {
	forEach.call(arguments, value);
	slice.call(arguments, 1).forEach(extend, dest);
	return dest;
};
