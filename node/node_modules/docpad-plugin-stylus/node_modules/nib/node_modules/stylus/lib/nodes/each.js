
/*!
 * Stylus - Each
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Each` node with the given `val` name,
 * `key` name, `expr`, and `block`.
 *
 * @param {String} val
 * @param {String} key
 * @param {Expression} expr
 * @param {Block} block
 * @api public
 */

var Each = module.exports = function Each(val, key, expr, block){
  Node.call(this);
  this.val = val;
  this.key = key;
  this.expr = expr;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

Each.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Each.prototype.clone = function(){
  var clone = new Each(
      this.val
    , this.key
    , this.expr.clone()
    , this.block.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};