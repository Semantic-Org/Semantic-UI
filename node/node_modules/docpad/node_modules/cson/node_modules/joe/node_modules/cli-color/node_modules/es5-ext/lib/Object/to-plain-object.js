'use strict';

var isObject = require('./is-object')

  , getPrototypeOf = Object.getPrototypeOf, keys = Object.keys
  , prototype = Object.prototype

  , extend;

extend = function (obj, src) {
	var proto;
	keys(src).forEach(function (key) {
		if (!obj.hasOwnProperty(key)) {
			obj[key] = src[key];
		}
	});
	proto = getPrototypeOf(src);
	return ((proto === prototype) || !proto) ? obj : extend(obj, proto);
};

module.exports = function (src) {
	var obj = {};
	if (!src || !isObject(src)) return obj;
	return extend(obj, src);
};
