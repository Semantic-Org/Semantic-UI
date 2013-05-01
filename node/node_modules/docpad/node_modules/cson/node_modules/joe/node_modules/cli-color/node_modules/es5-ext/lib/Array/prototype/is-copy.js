'use strict';

var ois   = require('../../Object/is')
  , value = require('../../Object/valid-value');

module.exports = function (other) {
	var i, l;
	value(this) && value(other);
	l = this.length >>> 0;
	if (l !== (other.length >>> 0)) return false;
	for (i = 0; i < l; ++i) {
		if (this.hasOwnProperty(i) !== other.hasOwnProperty(i)) return false;
		if (!ois(this[i], other[i])) return false;
	}
	return true;
};
