'use strict';

var repeat = require('./repeat')

  , replace = String.prototype.replace

  , re = /(\r\n|[\n\r\u2028\u2029])([\u0000-\u0009\u000b-\uffff]+)/g;

module.exports = function (indent/*, count*/) {
	indent = repeat.call(String(indent), arguments[1]);
	return indent + replace.call(this, re, '$1' + indent + '$2');
};
