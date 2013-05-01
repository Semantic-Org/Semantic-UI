'use strict';

var callable = require('../../Object/valid-callable')
  , value    = require('../../Object/valid-value')

  , some = Array.prototype.some, apply = Function.prototype.apply;

module.exports = function (query/*, thisArg*/) {
	var r, self;
	self = Object(value(this));
	callable(query);

	return some.call(self, function (value) {
		if (apply.call(query, this, arguments)) {
			r = value;
			return true;
		}
		return false;
	}, arguments[1]) ? r : null;
};
