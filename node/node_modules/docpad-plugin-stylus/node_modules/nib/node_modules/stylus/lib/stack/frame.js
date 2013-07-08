
/*!
 * Stylus - stack - Frame
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Scope = require('./scope')
  , blocks = require('../nodes');

/**
 * Initialize a new `Frame` with the given `block`.
 *
 * @param {Block} block
 * @api private
 */

var Frame = module.exports = function Frame(block) {
  this._scope = false === block.scope
    ? null
    : new Scope;
  this.block = block;
};

/**
 * Return this frame's scope or the parent scope
 * for scope-less blocks.
 *
 * @return {Scope}
 * @api public
 */

Frame.prototype.__defineGetter__('scope', function(){
  return this._scope || this.parent.scope;
});

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Frame.prototype.lookup = function(name){
  return this.scope.lookup(name)
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Frame.prototype.inspect = function(){
  return '[Frame '
    + (false === this.block.scope
        ? 'scope-less'
        : this.scope.inspect())
    + ']';
};
