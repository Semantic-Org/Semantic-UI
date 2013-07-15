
/*!
 * Stylus - UnaryOp
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `UnaryOp` with `op`, and `expr`.
 *
 * @param {String} op
 * @param {Node} expr
 * @api public
 */

var UnaryOp = module.exports = function UnaryOp(op, expr){
  Node.call(this);
  this.op = op;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

UnaryOp.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

UnaryOp.prototype.clone = function(){
  var clone = new UnaryOp(this.op, this.expr.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};