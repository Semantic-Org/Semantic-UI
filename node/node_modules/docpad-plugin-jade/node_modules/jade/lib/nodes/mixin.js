
/*!
 * Jade - nodes - Mixin
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Attrs = require('./attrs');

/**
 * Initialize a new `Mixin` with `name` and `block`.
 *
 * @param {String} name
 * @param {String} args
 * @param {Block} block
 * @api public
 */

var Mixin = module.exports = function Mixin(name, args, block, call){
  this.name = name;
  this.args = args;
  this.block = block;
  this.attrs = [];
  this.call = call;
};

/**
 * Inherit from `Attrs`.
 */

Mixin.prototype.__proto__ = Attrs.prototype;

