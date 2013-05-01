'use strict';

var replace = String.prototype.replace
  , re = /([a-z])([A-Z])/g;

module.exports = function () {
	return replace.call(this, re, "$1-$2").toLowerCase();
};
