'use strict';

var isEmpty = require('es5-ext/lib/Object/is-empty')
  , value   = require('es5-ext/lib/Object/valid-value')
  , id      = require('./_id');

module.exports = function (obj/*, type*/) {
	var type;
	value(obj);
	type = arguments[1];
	if (arguments.length > 1) {
		return obj.hasOwnProperty(id) && obj[id].hasOwnProperty(type);
	} else {
		return obj.hasOwnProperty(id) && !isEmpty(obj[id]);
	}
};
