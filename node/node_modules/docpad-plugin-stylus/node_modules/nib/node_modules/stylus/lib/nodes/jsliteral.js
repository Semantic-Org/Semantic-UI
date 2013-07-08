
/*!
 * Stylus - JSLiteral
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `JSLiteral` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var JSLiteral = module.exports = function JSLiteral(str){
  Node.call(this);
  this.val = str;
  this.string = str;
};

/**
 * Inherit from `Node.prototype`.
 */

JSLiteral.prototype.__proto__ = Node.prototype;
