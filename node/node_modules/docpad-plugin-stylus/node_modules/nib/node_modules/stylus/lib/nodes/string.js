
/*!
 * Stylus - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , sprintf = require('../functions').s
  , utils = require('../utils')
  , nodes = require('./');

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {String} val
 * @param {String} quote
 * @api public
 */

var String = module.exports = function String(val, quote){
  Node.call(this);
  this.val = val;
  this.string = val;
  this.quote = quote || "'";
};

/**
 * Inherit from `Node.prototype`.
 */

String.prototype.__proto__ = Node.prototype;

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

String.prototype.toString = function(){
  return this.quote + this.val + this.quote;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

String.prototype.clone = function(){
  var clone = new String(this.val, this.quote);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

String.prototype.toBoolean = function(){
  return nodes.Boolean(this.val.length);
};

/**
 * Coerce `other` to a string.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

String.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'string':
      return other;
    case 'expression':
      return new String(other.nodes.map(function(node){
        return this.coerce(node).val;
      }, this).join(' '));
    default:
      return new String(other.toString());
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

String.prototype.operate = function(op, right){
  switch (op) {
    case '%':
      var expr = new nodes.Expression;
      expr.push(this);

      // constructargs
      var args = 'expression' == right.nodeName
        ? utils.unwrap(right).nodes
        : [right];

      // apply
      return sprintf.apply(null, [expr].concat(args));
    case '+':
      return new String(this.val + this.coerce(right).val);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};
