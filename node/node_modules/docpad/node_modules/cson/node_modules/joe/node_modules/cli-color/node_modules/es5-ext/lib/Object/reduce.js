'use strict';

var isCallable = require('./is-callable')
  , callable   = require('./valid-callable')
  , value      = require('./valid-value')

  , call = Function.prototype.call, keys = Object.keys;

module.exports = exports = function self(obj, cb/*, initial, compareFn*/) {
	var list, fn, initial, compareFn, initialized;
	value(obj) && callable(cb);

	obj = Object(obj);
	initial = arguments[2];
	compareFn = arguments[3];

	list = keys(obj);
	if (compareFn) {
		list.sort(isCallable(compareFn) ? compareFn.bind(obj) : undefined);
	}

	fn = function (value, key, index) {
		if (initialized) {
			return call.call(cb, undefined, value, obj[key], key, obj, index);
		} else {
			initialized = true;
			return call.call(cb, undefined, obj[value], obj[key], key, obj, index,
				value);
		}
	};

	if ((arguments.length < 3) || (initial === self.NO_INITIAL)) {
		return list.reduce(fn);
	} else {
		initialized = true;
		return list.reduce(fn, initial);
	}
};
exports.NO_INITIAL = {};
