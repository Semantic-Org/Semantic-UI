
/*!
 * Stylus - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `Selector` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var Selector = module.exports = function Selector(segs){
  Node.call(this);
  this.inherits = true;
  this.segments = segs;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.segments.join('');
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Selector.prototype.clone = function(){
  var clone = new Selector;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.segments = this.segments.map(function(node){ return node.clone(); });
  return clone;
};
