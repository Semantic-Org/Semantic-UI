'use strict';

var value = require('../../Object/valid-value');

module.exports = function () {
	var i, l;
	if (!(l = (value(this).length >>> 0))) {
		return null;
	}
	i = l - 1;
	while (!this.hasOwnProperty(i)) {
		if (--i === -1) {
			return null;
		}
	}
	return i;
};
