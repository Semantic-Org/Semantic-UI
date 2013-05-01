
/*!
 * Stylus - Normalizer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , fs = require('fs');

/**
 * Initialize a new `Normalizer` with the given `root` Node.
 *
 * This visitor implements the first stage of the duel-stage
 * compiler, tasked with stripping the "garbage" from
 * the evaluated nodes, ditching null rules, resolving
 * ruleset selectors etc. This step performs the logic
 * necessary to facilitate the "@extend" functionality,
 * as these must be resolved _before_ buffering output.
 *
 * @param {Node} root
 * @api public
 */

var Normalizer = module.exports = function Normalizer(root, options) {
  options = options || {};
  Visitor.call(this, root);
  this.stack = [];
  this.extends = {};
  this.map = {};
};

/**
 * Inherit from `Visitor.prototype`.
 */

Normalizer.prototype.__proto__ = Visitor.prototype;

/**
 * Normalize the node tree.
 *
 * @return {Node}
 * @api private
 */

Normalizer.prototype.normalize = function(){
  return this.visit(this.root);
};

/**
 * Visit Root.
 */

Normalizer.prototype.visitRoot = function(block){
  var ret = new nodes.Root
    , node;

  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'null':
      case 'expression':
      case 'function':
      case 'jsliteral':
      case 'unit':
        continue;
      default:
        ret.push(this.visit(node));
    }
  }

  return ret;
};

/**
 * Visit Block.
 */

Normalizer.prototype.visitBlock = function(block){
  var ret = new nodes.Block
    , node;

  if (block.hasProperties) {
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'jsliteral':
        case 'group':
        case 'unit':
          continue;
        default:
          ret.push(this.visit(node));
      }
    }
  }

  // nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    ret.push(this.visit(node));
  }

  return block;
};

/**
 * Visit Group.
 */

Normalizer.prototype.visitGroup = function(group){
  // TODO: clean this mess up
  var stack = this.stack
    , map = this.map
    , self = this;

  stack.push(group.nodes);

  var selectors = this.compileSelectors(stack);

  // map for extension lookup
  selectors.forEach(function(selector){
    map[selector] = map[selector] || [];
    map[selector].push(group);
  });

  // extensions
  this.extend(group, selectors);

  group.block = this.visit(group.block);
  stack.pop();
  return group;
};

/**
 * Visit Media.
 */

Normalizer.prototype.visitMedia = function(media){
  var props = []
    , other = [];

  media.block.nodes.forEach(function(node, i) {
    if ('property' == node.nodeName) {
      props.push(node);
    } else {
      other.push(node);
    }
  });

  // Fake self-referencing group to contain
  // any props that are floating
  // directly on the @media declaration
  if (props.length) {
    var selfLiteral = new nodes.Literal('&');
    selfLiteral.lineno = media.lineno;
    selfLiteral.filename = media.filename;

    var selfSelector = new nodes.Selector(selfLiteral);
    selfSelector.lineno = media.lineno;
    selfSelector.filename = media.filename;
    selfSelector.val = selfLiteral.val;

    var propertyGroup = new nodes.Group;
    propertyGroup.lineno = media.lineno;
    propertyGroup.filename = media.filename;

    var propertyBlock = new nodes.Block(media.block, propertyGroup);
    propertyBlock.lineno = media.lineno;
    propertyBlock.filename = media.filename;

    props.forEach(function(prop){
      propertyBlock.push(prop);
    });

    propertyGroup.push(selfSelector);
    propertyGroup.block = propertyBlock;

    media.block.nodes = [];
    media.block.push(propertyGroup);
    other.forEach(function(node){
      media.block.push(node);
    });
  }

  return media;
}

/**
 * Apply `group` extensions.
 *
 * @param {Group} group
 * @param {Array} selectors
 * @api private
 */

Normalizer.prototype.extend = function(group, selectors){
  var map = this.map
    , self = this;

  group.block.node.extends.forEach(function(extend){
    var groups = map[extend];
    if (!groups) throw new Error('Failed to @extend "' + extend + '"');
    selectors.forEach(function(selector){
      var node = new nodes.Selector;
      node.val = selector;
      node.inherits = false;
      groups.forEach(function(group){
        if (!group.nodes.some(function(n){ return n.val == selector })) {
          self.extend(group, selectors);
          group.push(node);
        }
      });
    });
  });
};

/**
 * Compile selector strings in `arr` from the bottom-up
 * to produce the selector combinations. For example
 * the following Stylus:
 *
 *    ul
 *      li
 *      p
 *        a
 *          color: red
 *
 * Would return:
 *
 *      [ 'ul li a', 'ul p a' ]
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

Normalizer.prototype.compileSelectors = function(arr){
  // TODO: remove this duplication
  var stack = this.stack
    , self = this
    , selectors = []
    , buf = [];

  function compile(arr, i) {
    if (i) {
      arr[i].forEach(function(selector){
        buf.unshift(selector.val);
        compile(arr, i - 1);
        buf.shift();
      });
    } else {
      arr[0].forEach(function(selector){
        var str = selector.val.trim();
        if (buf.length) {
          for (var i = 0, len = buf.length; i < len; ++i) {
            if (~buf[i].indexOf('&')) {
              str = buf[i].replace(/&/g, str).trim();
            } else {
              str += ' ' + buf[i].trim();
            }
          }
        }
        selectors.push(str.trimRight());
      });
    }
  }

  compile(arr, arr.length - 1);

  return selectors;
};
