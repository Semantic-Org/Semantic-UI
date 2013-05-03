'use strict';

var value = require('../Object/valid-value');

module.exports = function (name, val) {
	return function (obj) { value(obj)[name] = val; };
};
