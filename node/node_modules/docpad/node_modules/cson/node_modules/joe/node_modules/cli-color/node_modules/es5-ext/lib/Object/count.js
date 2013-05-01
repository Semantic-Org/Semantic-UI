'use strict';

var value = require('./valid-value')

  , keys = Object.keys;

module.exports = function (obj) {
	return keys(Object(value(obj))).length;
};
