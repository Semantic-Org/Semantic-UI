'use strict';

var callable = require('../../Object/valid-callable')

  , apply = Function.prototype.apply;

module.exports = function () {
	var fn = callable(this);
	return function (args) {
		return apply.call(fn, this, args);
	};
};
