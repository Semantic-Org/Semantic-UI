'use strict';

var value = require('../../Object/valid-value');

module.exports = function () {
	var i, l;
	if (!(l = (value(this).length >>> 0))) {
		return null;
	}
	i = 0;
	while (!this.hasOwnProperty(i)) {
		if (++i === l) {
			return null;
		}
	}
	return i;
};
