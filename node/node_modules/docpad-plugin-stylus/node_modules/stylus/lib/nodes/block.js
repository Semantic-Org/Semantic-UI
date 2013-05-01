
/*!
 * Stylus - Block
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Block` node with `parent` Block.
 *
 * @param {Block} parent
 * @api public
 */

var Block = module.exports = function Block(parent, node){
  Node.call(this);
  this.nodes = [];
  this.parent = parent;
  this.node = node;
  this.scope = true;
};

/**
 * Inherit from `Node.prototype`.
 */

Block.prototype.__proto__ = Node.prototype;

/**
 * Check if this block has properties..
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('hasProperties', function(){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    if ('property' == this.nodes[i].nodeName) {
      return true;
    }
  }
});

/**
 * Check if this block is empty.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Block.prototype.clone = function(){
  var clone = new Block(this.parent, this.node);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.scope = this.scope;
  this.nodes.forEach(function(node){
    node = node.clone();
    switch (node.nodeName) {
      case 'each':
      case 'group':
        node.block.parent = clone;
        break;
      case 'ident':
        if ('function' == node.val.nodeName) {
          node.val.block.parent = clone;
        }
    }
    clone.push(node);
  });
  return clone;
};

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Block.prototype.push = function(node){
  this.nodes.push(node);
};
