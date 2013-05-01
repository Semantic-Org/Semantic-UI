
/*!
 * Stylus - Group
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Group`.
 *
 * @api public
 */

var Group = module.exports = function Group(){
  Node.call(this);
  this.nodes = [];
  this.extends = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Group.prototype.__proto__ = Node.prototype;

/**
 * Push the given `selector` node.
 *
 * @param {Selector} selector
 * @api public
 */

Group.prototype.push = function(selector){
  this.nodes.push(selector);
};

/**
 * Return this set's `Block`.
 */

Group.prototype.__defineGetter__('block', function(){
  return this.nodes[0].block;
});

/**
 * Assign `block` to each selector in this set.
 *
 * @param {Block} block
 * @api public
 */

Group.prototype.__defineSetter__('block', function(block){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    this.nodes[i].block = block;
  }
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Group.prototype.clone = function(){
  var clone = new Group;
  clone.lineno = this.lineno;
  this.nodes.forEach(function(node){
    clone.push(node.clone());
  });
  clone.filename = this.filename;
  clone.block = this.block.clone();
  return clone;
};
