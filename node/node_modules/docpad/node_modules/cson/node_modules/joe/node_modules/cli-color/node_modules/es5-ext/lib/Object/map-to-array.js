'use strict';

var callable = require('./valid-callable')
  , forEach  = require('./for-each')

  , call = Function.prototype.call

  , defaultCb = function (value, key) { return [key, value]; };

module.exports = function (obj, cb/*, thisArg, compareFn*/) {
	var a = [], thisArg = arguments[2];
	cb = (cb == null) ? defaultCb : callable(cb);

	forEach(obj, function (value, key, obj, index) {
		a.push(call.call(cb, thisArg, value, key, this, index));
	}, obj, arguments[3]);
	return a;
};
