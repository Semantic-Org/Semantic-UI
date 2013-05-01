'use strict';

var isArguments   = require('../Function/is-arguments')

  , isArray = Array.isArray, slice = Array.prototype.slice;

module.exports = function (obj) {
	if (isArray(obj)) {
		return obj;
	} else if (isArguments(obj)) {
		return (obj.length === 1) ? [obj[0]] : Array.apply(null, obj);
	} else {
		return slice.call(obj);
	}
};
