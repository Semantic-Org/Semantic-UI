'use strict';

var strCompare = require('../String/prototype/case-insensitive-compare')
  , isObject   = require('./is-object')

  , resolve, typeMap;

typeMap = {
	undefined: 0,
	object: 1,
	'boolean': 2,
	string: 3,
	number: 4
};

resolve = function (a) {
	if (isObject(a)) {
		a = a.valueOf();
		if (isObject(a)) {
			a = a.toString();
		}
	}
	return a;
};

module.exports = function (a, b) {
	if (a === b) {
		// Same
		return 0;
	}
	a = resolve(a);
	b = resolve(b);
	if (a == b) { //jslint: skip
		return typeMap[typeof a] - typeMap[typeof b];
	} else if (a == null) {
		return -1;
	} else if (b == null) {
		return 1;
	} else if ((typeof a === 'string') || (typeof b === 'string')) {
		return strCompare.call(a, b);
	} else {
		return Number(a) - Number(b);
	}
};
