'use strict';

var numIsNaN = require('../../Number/is-nan')
  , ois      = require('../../Object/is')
  , value    = require('../../Object/valid-value')

  , lastIndexOf = Array.prototype.lastIndexOf;

module.exports = function (searchElement/*, fromIndex*/) {
	var i, fromIndex;
	if (!numIsNaN(searchElement) && (searchElement !== 0)) {
		return lastIndexOf.apply(this, arguments);
	}

	value(this);
	fromIndex = Number(arguments[1]);
	fromIndex = numIsNaN(fromIndex) ? ((this.length >>> 0) - 1) : fromIndex;
	for (i = fromIndex; i >= 0; --i) {
		if (this.hasOwnProperty(i) && ois(searchElement, this[i])) {
			return i;
		}
	}
	return -1;
};
