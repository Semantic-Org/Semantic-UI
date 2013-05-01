
/*!
 * Stylus - errors
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Expose constructors.
 */

exports.ParseError = ParseError;
exports.SyntaxError = SyntaxError;

/**
 * Inherit from `Error.prototype`.
 */

SyntaxError.prototype.__proto__ = Error.prototype;

/**
 * Initialize a new `ParseError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function ParseError(msg) {
  this.name = 'ParseError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
}

/**
 * Inherit from `Error.prototype`.
 */

ParseError.prototype.__proto__ = Error.prototype;

/**
 * Initialize a new `SyntaxError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function SyntaxError(msg) {
  this.name = 'SyntaxError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
}

/**
 * Inherit from `Error.prototype`.
 */

SyntaxError.prototype.__proto__ = Error.prototype;

