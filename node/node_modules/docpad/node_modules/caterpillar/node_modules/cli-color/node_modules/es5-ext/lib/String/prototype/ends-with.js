'use strict';

var toUint = require('../../Number/to-uint')
  , value  = require('../../Object/valid-value')

  , min = Math.min;

module.exports = function (searchString/*, endPosition*/) {
	var self, start, endPos;
	self = String(value(this));
	searchString = String(searchString);
	endPos = arguments[1];
	start = ((endPos == null) ? self.length :
			min(toUint(endPos), self.length)) - searchString.length;
	return (start < 0) ? false : (self.indexOf(searchString, start) === start);
};
