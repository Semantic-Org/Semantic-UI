'use strict';

var ois  = require('./is')
  , some = require('./some');

module.exports = function (obj, searchValue) {
	var r;
	return some(obj, function (value, name) {
		if (ois(value, searchValue)) {
			r = name;
			return true;
		}
		return false;
	}) ? r : null;
};
