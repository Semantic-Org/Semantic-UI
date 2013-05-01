'use strict';

var callable = require('../../Object/valid-callable')
  , value    = require('../../Object/valid-value')

  , call = Function.prototype.call;

module.exports = function (cb/*, thisArg*/) {
	var i, self, thisArg;
	self = Object(value(this));
	callable(cb);
	thisArg = arguments[1];

	for (i = self.length; i >= 0; --i) {
		if (self.hasOwnProperty(i) && call.call(cb, thisArg, self[i], i, self)) {
			return true;
		}
	}
	return false;
};
