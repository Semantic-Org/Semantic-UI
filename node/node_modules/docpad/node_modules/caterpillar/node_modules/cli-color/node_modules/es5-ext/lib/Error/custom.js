'use strict';

var d      = require('../Object/descriptor')
  , extend = require('../Object/extend')

  , captureStackTrace = Error.captureStackTrace
  , CustomError;

CustomError = module.exports = function CustomError(message, code/*, ext*/) {
	var ext = arguments[2];
	if (ext != null) extend(this, ext);
	this.message = String(message);
	if (code != null) this.code = String(code);
	if (captureStackTrace) captureStackTrace(this, CustomError);
};

CustomError.prototype = Object.create(Error.prototype, {
	constructor: d(CustomError),
	name: d('CustomError')
});
