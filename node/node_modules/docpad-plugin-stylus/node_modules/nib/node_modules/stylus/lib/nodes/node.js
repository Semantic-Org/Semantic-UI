
/*!
 * Stylus - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Evaluator = require('../visitor/evaluator')
  , utils = require('../utils')
  , nodes = require('./');

/**
 * Node constructor.
 *
 * @api public
 */

var Node = module.exports = function Node(){
  this.lineno = nodes.lineno;
  Object.defineProperty(this, 'filename', { writable: true, value: nodes.filename });
};

/**
 * Return this node.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.__defineGetter__('first', function(){
  return this;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Node.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return node name.
 *
 * @return {String}
 * @api public
 */

Node.prototype.__defineGetter__('nodeName', function(){
  return this.constructor.name.toLowerCase();
});

/**
 * Return this node.
 * 
 * @return {Node}
 * @api public
 */

Node.prototype.clone = function(){
  return this;
};

/**
 * Nodes by default evaluate to themselves.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.eval = function(){
  return new Evaluator(this).evaluate();
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Return the expression, or wrap this node in an expression.
 *
 * @return {Expression}
 * @api public
 */

Node.prototype.toExpression = function(){
  if ('expression' == this.nodeName) return this;
  var expr = new nodes.Expression;
  expr.push(this);
  return expr;
};

/**
 * Return false if `op` is generally not coerced.
 *
 * @param {String} op
 * @return {Boolean}
 * @api private
 */

Node.prototype.shouldCoerce = function(op){
  switch (op) {
    case 'is a':
    case 'in':
    case '||':
    case '&&':
      return false;
    default:
      return true;
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

Node.prototype.operate = function(op, right){
  switch (op) {
    case 'is a':
      if ('string' == right.nodeName) {
        return nodes.Boolean(this.nodeName == right.val);
      } else {
        throw new Error('"is a" expects a string, got ' + right.toString());
      }
    case '==':
      return nodes.Boolean(this.hash == right.hash);
    case '!=':
      return nodes.Boolean(this.hash != right.hash);
    case '>=':
      return nodes.Boolean(this.hash >= right.hash);
    case '<=':
      return nodes.Boolean(this.hash <= right.hash);
    case '>':
      return nodes.Boolean(this.hash > right.hash);
    case '<':
      return nodes.Boolean(this.hash < right.hash);
    case '||':
      return this.toBoolean().isTrue
        ? this
        : right;
    case 'in':
      var vals = utils.unwrap(right).nodes
        , hash = this.hash;
      if (!vals) throw new Error('"in" given invalid right-hand operand, expecting an expression');
      for (var i = 0, len = vals.length; i < len; ++i) {
        if (hash == vals[i].hash) {
          return nodes.true;
        }
      }
      return nodes.false;
    case '&&':
      var a = this.toBoolean()
        , b = right.toBoolean();
      return a.isTrue && b.isTrue
        ? right
        : a.isFalse
          ? this
          : right;
    default:
      if ('[]' == op) {
        var msg = 'cannot perform '
          + this
          + '[' + right + ']';
      } else {
        var msg = 'cannot perform'
          + ' ' + this
          + ' ' + op
          + ' ' + right;
      }
      throw new Error(msg);
  }
};

/**
 * Initialize a new `CoercionError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function CoercionError(msg) {
  this.name = 'CoercionError'
  this.message = msg
  Error.captureStackTrace(this, CoercionError);
}

/**
 * Inherit from `Error.prototype`.
 */

CoercionError.prototype.__proto__ = Error.prototype;

/**
 * Default coercion throws.
 *
 * @param {Node} other
 * @return {Node}
 * @api public
 */

Node.prototype.coerce = function(other){
  if (other.nodeName == this.nodeName) return other;
  throw new CoercionError('cannot coerce ' + other + ' to ' + this.nodeName);
};
