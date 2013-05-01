
/*!
 * Jade - nodes - Literal
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a `Literal` node with the given `str.
 *
 * @param {String} str
 * @api public
 */

var Literal = module.exports = function Literal(str) {
  this.str = str
    .replace(/\\/g, "\\\\")
    .replace(/\n|\r\n/g, "\\n")
    .replace(/'/g, "\\'");
};

/**
 * Inherit from `Node`.
 */

Literal.prototype.__proto__ = Node.prototype;
