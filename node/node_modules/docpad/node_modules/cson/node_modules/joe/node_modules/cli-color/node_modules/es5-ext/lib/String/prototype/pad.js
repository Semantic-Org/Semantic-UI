'use strict';

var toInt  = require('../../Number/to-int')
  , value  = require('../../Object/valid-value')
  , repeat = require('./repeat')

  , abs = Math.abs, max = Math.max;

module.exports = function (fill/*, length*/) {
	var self = String(value(this))
	  , sLength = self.length
	  , length = arguments[1];

	length = isNaN(length) ? 1 : toInt(length);
	fill = repeat.call(String(fill), abs(length));
	if (length >= 0) {
		return fill.slice(0, max(0, length - sLength)) + self;
	} else {
		return self + (((sLength + length) >= 0) ? '' :
				fill.slice(length + sLength));
	}
};
