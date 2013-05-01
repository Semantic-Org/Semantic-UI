'use strict';

var find     = require('../../Array/prototype/common-left')
  , toString = require('../../Function/invoke')('toString', null)
  , value    = require('../../Object/valid-value')

  , map = Array.prototype.map;

module.exports = function (/*…str*/) {
	var self = String(value(this));
	return self.slice(find.apply(self, map.call(arguments, toString)));
};
