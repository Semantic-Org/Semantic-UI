
/*!
 * Jade - nodes - Case
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Case` with `expr`.
 *
 * @param {String} expr
 * @api public
 */

var Case = exports = module.exports = function Case(expr, block){
  this.expr = expr;
  this.block = block;
};

/**
 * Inherit from `Node`.
 */

Case.prototype.__proto__ = Node.prototype;

var When = exports.When = function When(expr, block){
  this.expr = expr;
  this.block = block;
  this.debug = false;
};

/**
 * Inherit from `Node`.
 */

When.prototype.__proto__ = Node.prototype;

