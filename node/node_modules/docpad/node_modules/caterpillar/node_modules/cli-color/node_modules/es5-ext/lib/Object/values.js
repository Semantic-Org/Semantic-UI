'use strict';

var value = require('./valid-value')

  , keys = Object.keys

  , get = function (key) { return this[key]; };

module.exports = function (obj) {
	return keys(Object(value(obj))).map(get, obj);
};
