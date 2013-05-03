'use strict';

var callable = require('../../Object/valid-callable')

  , slice = Array.prototype.slice, apply = Function.prototype.apply

  , curry = function self(fn, n, inputArgs) {
	return function () {
		var args = inputArgs ?
				inputArgs.concat(slice.call(arguments, 0, n - inputArgs.length)) :
				slice.call(arguments, 0, n);
		return (args.length === n) ? apply.call(fn, this, args) :
				self(fn, n, args);
	};
};

module.exports = function (/*n*/) {
	var n = arguments[0];
	return curry(callable(this), isNaN(n) ? this.length : Number(n));
};
