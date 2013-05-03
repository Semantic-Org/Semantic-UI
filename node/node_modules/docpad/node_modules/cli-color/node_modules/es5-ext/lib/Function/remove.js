'use strict';

var value = require('../Object/valid-value');

module.exports = function (name) {
	return function (obj) { delete value(obj)[name]; };
};
