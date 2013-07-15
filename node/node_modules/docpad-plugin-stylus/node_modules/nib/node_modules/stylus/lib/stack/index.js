
/*!
 * Stylus - Stack
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Frame = require('./frame');

/**
 * Initialize a new `Stack`.
 *
 * @api private
 */

var Stack = module.exports = function Stack() {
  Array.apply(this, arguments);
};

/**
 * Inherit from `Array.prototype`.
 */

Stack.prototype.__proto__ = Array.prototype;

/**
 * Push the given `frame`.
 *
 * @param {Frame} frame
 * @api public
 */

Stack.prototype.push = function(frame){
  frame.stack = this;
  frame.parent = this.currentFrame;
  return [].push.apply(this, arguments);
};

/**
 * Return the current stack `Frame`.
 *
 * @return {Frame}
 * @api private
 */

Stack.prototype.__defineGetter__('currentFrame', function(){
  return this[this.length - 1];
});

/**
 * Lookup stack frame for the given `block`.
 *
 * @param {Block} block
 * @return {Frame}
 * @api private
 */

Stack.prototype.getBlockFrame = function(block){
  for (var i = 0; i < this.length; ++i) {
    if (block == this[i].block) {
      return this[i];
    }
  }
};

/**
 * Lookup the given local variable `name`, relative
 * to the lexical scope of the current frame's `Block`.
 *
 * When the result of a lookup is an identifier
 * a recursive lookup is performed, defaulting to
 * returning the identifier itself.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Stack.prototype.lookup = function(name){
  var block = this.currentFrame.block
    , val
    , ret;

  do {
    var frame = this.getBlockFrame(block);
    if (frame && (val = frame.lookup(name))) {
      switch (val.first.nodeName) {
        case 'ident':
          return this.lookup(val.first.name) || val;
        default:
          return val;
      }
    }
  } while (block = block.parent);
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api private
 */

Stack.prototype.inspect = function(){
  return this.reverse().map(function(frame){
    return frame.inspect();
  }).join('\n');
};

/**
 * Return stack string formatted as:
 *
 *   at <context> (<filename>:<lineno>)
 *
 * @return {String}
 * @api private
 */

Stack.prototype.toString = function(){
  var block
    , node
    , buf = []
    , location
    , len = this.length;

  while (len--) {
    block = this[len].block;
    if (node = block.node) {
      location = '(' + node.filename + ':' + (node.lineno + 1) + ')';
      switch (node.nodeName) {
        case 'function':
          buf.push('    at ' + node.name + '() ' + location);
          break;
        case 'group':
          buf.push('    at "' + node.nodes[0].val + '" ' + location);
          break;
      }
    }
  }

  return buf.join('\n');
};