'use strict';

var value = require('./valid-value');

module.exports = function (obj) {
	var i;
	value(obj);
	for (i in obj) { //jslint: skip
		if (obj.propertyIsEnumerable(i)) return false;
	}
	return true;
};
