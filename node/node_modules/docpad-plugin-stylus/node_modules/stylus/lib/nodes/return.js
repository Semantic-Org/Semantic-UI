
/*!
 * Stylus - Return
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Return` node with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Return = module.exports = function Return(expr){
  this.expr = expr || nodes.null;
};

/**
 * Inherit from `Node.prototype`.
 */

Return.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Return.prototype.clone = function(){
  var clone = new Return(this.expr.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};