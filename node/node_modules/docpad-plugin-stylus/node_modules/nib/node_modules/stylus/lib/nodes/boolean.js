
/*!
 * Stylus - Boolean
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Boolean` node with the given `val`.
 *
 * @param {Boolean} val
 * @api public
 */

var Boolean = module.exports = function Boolean(val){
  Node.call(this);
  if (this.nodeName) {
    this.val = !!val;
  } else {
    return new Boolean(val);
  }
};

/**
 * Inherit from `Node.prototype`.
 */

Boolean.prototype.__proto__ = Node.prototype;

/**
 * Return `this` node.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.toBoolean = function(){
  return this;
};

/**
 * Return `true` if this node represents `true`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isTrue', function(){
  return this.val;
});

/**
 * Return `true` if this node represents `false`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isFalse', function(){
  return ! this.val;
});

/**
 * Negate the value.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.negate = function(){
  return new Boolean(!this.val);
};

/**
 * Return 'Boolean'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.inspect = function(){
  return '[Boolean ' + this.val + ']';
};

/**
 * Return 'true' or 'false'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.toString = function(){
  return this.val
    ? 'true'
    : 'false';
};