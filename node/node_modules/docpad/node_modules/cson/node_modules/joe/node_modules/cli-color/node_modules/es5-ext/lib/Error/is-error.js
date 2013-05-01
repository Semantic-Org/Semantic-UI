'use strict';

var toString = Object.prototype.toString

  , id = toString.call(new Error())
  , exceptionRe = /^\[object [a-zA-z0-9]*(?:Exception|Error)\]$/;

module.exports = function (x) {
	var xid;
	return (x && ((x instanceof Error) || ((xid = toString.call(x)) === id) ||
		xid.match(exceptionRe))) || false;
};
