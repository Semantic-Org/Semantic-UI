/*!
 * Stylus - Compiler
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
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *
 * @param {Node} root
 * @api public
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  this.firebug = options.firebug;
  this.linenos = options.linenos;
  this.spaces = options['indent spaces'] || 2;
  this.includeCSS = options['include css'];
  this.indents = 1;
  Visitor.call(this, root);
  this.stack = [];
  this.js = '';
};

/**
 * Inherit from `Visitor.prototype`.
 */

Compiler.prototype.__proto__ = Visitor.prototype;

/**
 * Compile to css, and return a string of CSS.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.compile = function(){
  return this.visit(this.root);
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.__defineGetter__('indent', function(){
  if (this.compress) return '';
  return new Array(this.indents).join(Array(this.spaces + 1).join(' '));
});

/**
 * Visit Root.
 */

Compiler.prototype.visitRoot = function(block){
  this.buf = '';
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (this.linenos || this.firebug) this.debugInfo(node);
    var ret = this.visit(node);
    if (ret) this.buf += ret + '\n';
  }
  return this.buf;
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  var node;

  if (block.hasProperties) {
    var arr = [this.compress ? '{' : ' {'];
    ++this.indents;
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
        case 'media':
          // Prevent double-writing the @media declaration when
          // nested inside of a function/mixin
          if (node.block.parent.scope) {
            continue;
          }
        default:
          arr.push(this.visit(node));
      }
    }
    --this.indents;
    arr.push(this.indent + '}');
    this.buf += arr.join(this.compress ? '' : '\n');
    this.buf += '\n';
  }

  // Nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'group':
      case 'print':
      case 'page':
      case 'block':
      case 'keyframes':
        if (this.linenos || this.firebug) this.debugInfo(node);
        this.visit(node);
        break;
      case 'media':
      case 'mozdocument':
      case 'import':
      case 'fontface':
        this.visit(node);
        break;
      case 'literal':
        this.buf += this.visit(node) + '\n';
        break;
    }
  }
};

/**
 * Visit Keyframes.
 */

Compiler.prototype.visitKeyframes = function(node){
  var comma = this.compress ? ',' : ', ';

  var prefix = 'official' == node.prefix
    ? ''
    : '-' + node.prefix + '-';

  this.buf += '@' + prefix + 'keyframes '
    + this.visit(node.name)
    + (this.compress ? '{' : ' {');

  ++this.indents;
  node.frames.forEach(function(frame){
    if (!this.compress) this.buf += '\n  ';
    this.buf += this.visit(frame.pos.join(comma));
    this.visit(frame.block);
  }, this);
  --this.indents;

  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit Media.
 */

Compiler.prototype.visitMedia = function(media){
  this.buf += '@media ' + media.val;
  this.buf += this.compress ? '{' : ' {\n';
  ++this.indents;
  this.visit(media.block);
  --this.indents;
  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit MozDocument.
 */

Compiler.prototype.visitMozDocument = function(mozdocument){
  this.buf += '@-moz-document ' + mozdocument.val;
  this.buf += this.compress ? '{' : ' {\n';
  ++this.indents;
  this.visit(mozdocument.block);
  --this.indents;
  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit Page.
 */

Compiler.prototype.visitPage = function(page){
  this.buf += this.indent + '@page';
  this.buf += page.selector ? ' ' + page.selector : '';
  this.visit(page.block);
};

/**
 * Visit Import.
 */

Compiler.prototype.visitImport = function(imported){
  this.buf += '@import ' + this.visit(imported.path) + ';\n';
};

/**
 * Visit FontFace.
 */

Compiler.prototype.visitFontFace = function(face){
  this.buf += this.indent + '@font-face';
  this.visit(face.block);
};

/**
 * Visit JSLiteral.
 */

Compiler.prototype.visitJSLiteral = function(js){
  this.js += '\n' + js.val.replace(/@selector/g, '"' + this.selector + '"');
  return '';
};

/**
 * Visit Comment.
 */

Compiler.prototype.visitComment = function(comment){
  return this.compress
    ? comment.suppress
      ? ''
      : comment.str
    : comment.str;
};

/**
 * Visit Function.
 */

Compiler.prototype.visitFunction = function(fn){
  return fn.name;
};

/**
 * Visit Variable.
 */

Compiler.prototype.visitVariable = function(variable){
  return '';
};

/**
 * Visit Charset.
 */

Compiler.prototype.visitCharset = function(charset){
  return '@charset ' + this.visit(charset.val) + ';';
};

/**
 * Visit Literal.
 */

Compiler.prototype.visitLiteral = function(lit){
  var val = lit.val.trim();
  if (!this.includeCSS) val = val.replace(/^  /gm, '');
  return val;
};

/**
 * Visit Boolean.
 */

Compiler.prototype.visitBoolean = function(bool){
  return bool.toString();
};

/**
 * Visit RGBA.
 */

Compiler.prototype.visitRGBA = function(rgba){
  return rgba.toString();
};

/**
 * Visit HSLA.
 */

Compiler.prototype.visitHSLA = function(hsla){
  return hsla.rgba.toString();
};

/**
 * Visit Unit.
 */

Compiler.prototype.visitUnit = function(unit){
  var type = unit.type || ''
    , n = unit.val
    , float = n != (n | 0);

  // Compress
  if (this.compress) {
    // Zero is always '0', unless when
    // a percentage, this is required by keyframes
    if ('%' != type && 0 == n) return '0';
    // Omit leading '0' on floats
    if (float && n < 1 && n > -1) {
      return n.toString().replace('0.', '.') + type;
    }
  }

  return n.toString() + type;
};

/**
 * Visit Group.
 */

Compiler.prototype.visitGroup = function(group){
  var stack = this.stack;

  stack.push(group.nodes);

  // selectors
  if (group.block.hasProperties) {
    var selectors = this.compileSelectors(stack);
    this.buf += (this.selector = selectors.join(this.compress ? ',' : ',\n'));
  }

  // output block
  this.visit(group.block);
  stack.pop();
};

/**
 * Visit Ident.
 */

Compiler.prototype.visitIdent = function(ident){
  return ident.name;
};

/**
 * Visit String.
 */

Compiler.prototype.visitString = function(string){
  return this.isURL
    ? string.val
    : string.toString();
};

/**
 * Visit Null.
 */

Compiler.prototype.visitNull = function(node){
  return '';
};

/**
 * Visit Call.
 */

Compiler.prototype.visitCall = function(call){
  this.isURL = 'url' == call.name;
  var args = call.args.nodes.map(function(arg){
    return this.visit(arg);
  }, this).join(this.compress ? ',' : ', ');
  if (this.isURL) args = '"' + args + '"';
  this.isURL = false;
  return call.name + '(' + args + ')';
};

/**
 * Visit Expression.
 */

Compiler.prototype.visitExpression = function(expr){
  var buf = []
    , self = this
    , len = expr.nodes.length
    , nodes = expr.nodes.map(function(node){ return self.visit(node); });

  nodes.forEach(function(node, i){
    var last = i == len - 1;
    buf.push(node);
    if ('/' == nodes[i + 1] || '/' == node) return;
    if (last) return;
    buf.push(expr.isList
      ? (self.compress ? ',' : ', ')
      : (self.isURL ? '' : ' '));
  });

  return buf.join('');
};

/**
 * Visit Arguments.
 */

Compiler.prototype.visitArguments = Compiler.prototype.visitExpression;

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var self = this
    , val = this.visit(prop.expr).trim();
  return this.indent + (prop.name || prop.segments.join(''))
    + (this.compress ? ':' + val : ': ' + val)
    + (this.compress
        ? (this.last ? '' : ';')
        : ';');
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

Compiler.prototype.compileSelectors = function(arr){
  var stack = this.stack
    , self = this
    , selectors = []
    , buf = [];

  function interpolateParent(selector, buf) {
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
    return str;
  }

  function compile(arr, i) {
    if (i) {
      arr[i].forEach(function(selector){
        if (selector.inherits) {
          buf.unshift(selector.val);
          compile(arr, i - 1);
          buf.shift();
        } else {
          selectors.push(interpolateParent(selector, buf));
        }
      });
    } else {
      arr[0].forEach(function(selector){
        var str = interpolateParent(selector, buf);
        selectors.push(self.indent + str.trimRight());
      });
    }
  }

  compile(arr, arr.length - 1);

  return selectors;
};

/**
 * Debug info.
 */

Compiler.prototype.debugInfo = function(node){

  var path = node.filename == 'stdin' ? 'stdin' : fs.realpathSync(node.filename)
    , line = node.nodes ? node.nodes[0].lineno : node.lineno;

  if (this.linenos){
    this.buf += '\n/* ' + 'line ' + line + ' : ' + path + ' */\n';
  }

  if (this.firebug){
    // debug info for firebug, the crazy formatting is needed
    path = 'file\\\:\\\/\\\/' + path.replace(/(\/|\.)/g, '\\$1');
    line = '\\00003' + line;
    this.buf += '\n@media -stylus-debug-info'
      + '{filename{font-family:' + path
      + '}line{font-family:' + line + '}}\n';
  }
}
