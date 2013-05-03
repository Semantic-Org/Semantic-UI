'use strict';

var toUint = require('../Number/to-uint')
  , ois    = require('./is')

  , keys = Object.keys

  , isCopy;

isCopy = function (a, b, depth, cache) {
	var aKeys, bKeys, index, index2;

	if (((typeof a) !== (typeof b)) || (String(a) !== String(b))) {
		return false;
	}
	if (!a || (typeof a !== 'object')) {
		return true;
	}

	aKeys = keys(a);
	bKeys = keys(b);
	if (aKeys.length !== bKeys.length) {
		return false;
	}
	if (cache) {
		// Prevent infinite recursion
		index = cache.a.indexOf(a);
		if (index === -1) {
			index = cache.a.indexOf(b);
			if (index === -1) {
				cache.a.push(a);
				cache.b.push([b]);
			} else if (cache.b[index].indexOf(a) !== -1) {
				return true;
			} else {
				cache.b[index].push(a);
			}
		} else if ((cache.b[index].indexOf(b) !== -1) ||
				(((index2 = cache.a.indexOf(b)) !== -1) &&
				(cache.b[index2].indexOf(a) !== -1))) {
			return true;
		} else {
			cache.b[index].push(b);
		}
	}
	return aKeys.every(function (name) {
		if (!b.propertyIsEnumerable(name)) {
			return false;
		}
		if (ois(a[name], b[name])) {
			return true;
		}
		return depth ? isCopy(a[name], b[name], depth - 1, cache) : false;
	});
};

module.exports = function (a, b/*, depth*/) {
	var depth, cache;

	if (ois(a, b)) {
		return true;
	}

	depth = arguments[2];
	depth = isNaN(depth) ? 0 : toUint(depth);

	if (!isFinite(depth)) {
		cache = { a: [], b: [] };
	}

	return isCopy(a, b, depth, !isFinite(depth) && { a: [], b: [] });
};
