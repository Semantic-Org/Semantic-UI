'use strict';

var value = require('./valid-value')

  , keys = Object.keys

  , unset = function (key) { delete this[key]; };

module.exports = function (obj) {
	keys(Object(value(obj))).forEach(unset, obj);
	return obj;
};
