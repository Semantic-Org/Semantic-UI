'use strict';

var slice = Array.prototype.slice;

module.exports = function (/*…items*/) {
	return slice.call(arguments);
};
