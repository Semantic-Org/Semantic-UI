'use strict';

var isCallable = require('../Object/is-callable')
  , value      = require('../Object/valid-value')

  , slice = Array.prototype.slice, apply = Function.prototype.apply;

module.exports = function (name/*, …args*/) {
	var args, isFn;

	args = slice.call(arguments, 1);
	if (!(isFn = isCallable(name))) {
		name = String(name);
	}

	return function (obj) {
		return apply.call(isFn ? name : value(obj)[name], obj,
			args.concat(slice.call(arguments, 1)));
	};
};
