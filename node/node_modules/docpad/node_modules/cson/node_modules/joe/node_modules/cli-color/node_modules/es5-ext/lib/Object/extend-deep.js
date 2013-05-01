'use strict';

var isPlainObject = require('./is-plain-object')
  , value         = require('./valid-value')

  , forEach = Array.prototype.forEach, slice = Array.prototype.slice
  , keys = Object.keys

  , extend;

extend = function (src) {
	keys(Object(src)).forEach(function (key) {
		if (isPlainObject(this[key]) && isPlainObject(src[key])) {
			extend.call(this[key], src[key]);
		} else {
			this[key] = src[key];
		}
	}, this);
};

module.exports = function (dest/*, …src*/) {
	forEach.call(arguments, value);
	slice.call(arguments, 1).forEach(extend, dest);
	return dest;
};
