
/*!
 * Stylus - FontFace
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `FontFace` with the given `block`.
 *
 * @param {Block} block
 * @api public
 */

var FontFace = module.exports = function FontFace(block){
  Node.call(this);
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

FontFace.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

FontFace.prototype.clone = function(){
  var clone = new FontFace(this.block.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return `@oage name`.
 *
 * @return {String}
 * @api public
 */

FontFace.prototype.toString = function(){
  return '@font-face';
};
