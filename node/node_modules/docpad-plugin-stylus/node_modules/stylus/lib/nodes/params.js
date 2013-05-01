
/*!
 * Stylus - Params
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Params` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params} params
 * @param {Expression} body
 * @api public
 */

var Params = module.exports = function Params(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Params.prototype.__defineGetter__('length', function(){
  return this.nodes.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Params.prototype.__proto__ = Node.prototype;

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Params.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Params.prototype.clone = function(){
  var clone = new Params;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone());
  });
  return clone;
};

