
/*!
 * Stylus - Extend
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Extend` with the given `selector`.
 *
 * @param {Selector} selector
 * @api public
 */

var Extend = module.exports = function Extend(selector){
  Node.call(this);
  this.selector = selector;
};

/**
 * Inherit from `Node.prototype`.
 */

Extend.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Extend.prototype.clone = function(){
  return new Extend(this.selector);
};

/**
 * Return `@extend selector`.
 *
 * @return {String}
 * @api public
 */

Extend.prototype.toString = function(){
  return '@extend ' + this.selector;
};
