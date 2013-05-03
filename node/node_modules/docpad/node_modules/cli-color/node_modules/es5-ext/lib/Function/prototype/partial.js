'use strict';

var callable = require('../../Object/valid-callable')
  , toArray  = require('../../Array/from')

  , apply = Function.prototype.apply;

module.exports = function (/*…args*/) {
	var fn = callable(this)
	  , args = toArray(arguments);

	return function () {
		return apply.call(fn, this, args.concat(toArray(arguments)));
	};
};
