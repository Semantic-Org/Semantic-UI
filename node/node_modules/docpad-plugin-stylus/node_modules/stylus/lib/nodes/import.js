
/*!
 * Stylus - Import
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Import` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Import = module.exports = function Import(expr){
  Node.call(this);
  this.path = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Import.prototype.__proto__ = Node.prototype;
