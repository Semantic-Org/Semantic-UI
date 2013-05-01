'use strict';

var value   = require('../Object/valid-value');

module.exports = function (name) {
	return function (o) { return value(o)[name]; };
};
