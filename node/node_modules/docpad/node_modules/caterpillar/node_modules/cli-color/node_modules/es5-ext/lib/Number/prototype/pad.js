'use strict';

var pad   = require('../../String/prototype/pad')
  , toInt = require('../to-int')

  , toFixed = Number.prototype.toFixed;

module.exports = function (length/*, precision*/) {
	var precision;
	length = toInt(length);
	precision = toInt(arguments[1]);

	return pad.call(precision ? toFixed.call(this, precision) : this,
		'0', length + (precision ? (1 + precision) : 0));
};
