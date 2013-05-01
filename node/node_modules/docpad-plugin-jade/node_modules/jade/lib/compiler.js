
/*!
 * Jade - Compiler
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , filters = require('./filters')
  , doctypes = require('./doctypes')
  , selfClosing = require('./self-closing')
  , runtime = require('./runtime')
  , utils = require('./utils');

// if browser
//
// if (!Object.keys) {
//   Object.keys = function(obj){
//     var arr = [];
//     for (var key in obj) {
//       if (obj.hasOwnProperty(key)) {
//         arr.push(key);
//       }
//     }
//     return arr;
//   }
// }
//
// if (!String.prototype.trimLeft) {
//   String.prototype.trimLeft = function(){
//     return this.replace(/^\s+/, '');
//   }
// }
//
// end


/**
 * Initialize `Compiler` with the given `node`.
 *
 * @param {Node} node
 * @param {Object} options
 * @api public
 */

var Compiler = module.exports = function Compiler(node, options) {
  this.options = options = options || {};
  this.node = node;
  this.hasCompiledDoctype = false;
  this.hasCompiledTag = false;
  this.pp = options.pretty || false;
  this.debug = false !== options.compileDebug;
  this.indents = 0;
  this.parentIndents = 0;
  if (options.doctype) this.setDoctype(options.doctype);
};

/**
 * Compiler prototype.
 */

Compiler.prototype = {

  /**
   * Compile parse tree to JavaScript.
   *
   * @api public
   */

  compile: function(){
    this.buf = ['var interp;'];
    if (this.pp) this.buf.push("var __indent = [];");
    this.lastBufferedIdx = -1;
    this.visit(this.node);
    return this.buf.join('\n');
  },

  /**
   * Sets the default doctype `name`. Sets terse mode to `true` when
   * html 5 is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {string} name
   * @api public
   */

  setDoctype: function(name){
    name = (name && name.toLowerCase()) || 'default';
    this.doctype = doctypes[name] || '<!DOCTYPE ' + name + '>';
    this.terse = this.doctype.toLowerCase() == '<!doctype html>';
    this.xml = 0 == this.doctype.indexOf('<?xml');
  },

  /**
   * Buffer the given `str` optionally escaped.
   *
   * @param {String} str
   * @param {Boolean} esc
   * @api public
   */

  buffer: function(str, esc){
    if (esc) str = utils.escape(str);

    if (this.lastBufferedIdx == this.buf.length) {
      this.lastBuffered += str;
      this.buf[this.lastBufferedIdx - 1] = "buf.push('" + this.lastBuffered + "');"
    } else {
      this.buf.push("buf.push('" + str + "');");
      this.lastBuffered = str;
      this.lastBufferedIdx = this.buf.length;
    }
  },

  /**
   * Buffer an indent based on the current `indent`
   * property and an additional `offset`.
   *
   * @param {Number} offset
   * @param {Boolean} newline
   * @api public
   */

  prettyIndent: function(offset, newline){
    offset = offset || 0;
    newline = newline ? '\\n' : '';
    this.buffer(newline + Array(this.indents + offset).join('  '));
    if (this.parentIndents)
      this.buf.push("buf.push.apply(buf, __indent);");
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visit: function(node){
    var debug = this.debug;

    if (debug) {
      this.buf.push('__jade.unshift({ lineno: ' + node.line
        + ', filename: ' + (node.filename
          ? JSON.stringify(node.filename)
          : '__jade[0].filename')
        + ' });');
    }

    // Massive hack to fix our context
    // stack for - else[ if] etc
    if (false === node.debug && this.debug) {
      this.buf.pop();
      this.buf.pop();
    }

    this.visitNode(node);

    if (debug) this.buf.push('__jade.shift();');
  },

  /**
   * Visit `node`.
   *
   * @param {Node} node
   * @api public
   */

  visitNode: function(node){
    var name = node.constructor.name
      || node.constructor.toString().match(/function ([^(\s]+)()/)[1];
    return this['visit' + name](node);
  },

  /**
   * Visit case `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitCase: function(node){
    var _ = this.withinCase;
    this.withinCase = true;
    this.buf.push('switch (' + node.expr + '){');
    this.visit(node.block);
    this.buf.push('}');
    this.withinCase = _;
  },

  /**
   * Visit when `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitWhen: function(node){
    if ('default' == node.expr) {
      this.buf.push('default:');
    } else {
      this.buf.push('case ' + node.expr + ':');
    }
    this.visit(node.block);
    this.buf.push('  break;');
  },

  /**
   * Visit literal `node`.
   *
   * @param {Literal} node
   * @api public
   */

  visitLiteral: function(node){
    var str = node.str.replace(/\n/g, '\\\\n');
    this.buffer(str);
  },

  /**
   * Visit all nodes in `block`.
   *
   * @param {Block} block
   * @api public
   */

  visitBlock: function(block){
    var len = block.nodes.length
      , escape = this.escape
      , pp = this.pp

    // Block keyword has a special meaning in mixins
    if (this.parentIndents && block.mode) {
      if (pp) this.buf.push("__indent.push('" + Array(this.indents + 1).join('  ') + "');")
      this.buf.push('block && block();');
      if (pp) this.buf.push("__indent.pop();")
      return;
    }

    // Pretty print multi-line text
    if (pp && len > 1 && !escape && block.nodes[0].isText && block.nodes[1].isText)
      this.prettyIndent(1, true);

    for (var i = 0; i < len; ++i) {
      // Pretty print text
      if (pp && i > 0 && !escape && block.nodes[i].isText && block.nodes[i-1].isText)
        this.prettyIndent(1, false);

      this.visit(block.nodes[i]);
      // Multiple text nodes are separated by newlines
      if (block.nodes[i+1] && block.nodes[i].isText && block.nodes[i+1].isText)
        this.buffer('\\n');
    }
  },

  /**
   * Visit `doctype`. Sets terse mode to `true` when html 5
   * is used, causing self-closing tags to end with ">" vs "/>",
   * and boolean attributes are not mirrored.
   *
   * @param {Doctype} doctype
   * @api public
   */

  visitDoctype: function(doctype){
    if (doctype && (doctype.val || !this.doctype)) {
      this.setDoctype(doctype.val || 'default');
    }

    if (this.doctype) this.buffer(this.doctype);
    this.hasCompiledDoctype = true;
  },

  /**
   * Visit `mixin`, generating a function that
   * may be called within the template.
   *
   * @param {Mixin} mixin
   * @api public
   */

  visitMixin: function(mixin){
    var name = mixin.name.replace(/-/g, '_') + '_mixin'
      , args = mixin.args || ''
      , block = mixin.block
      , attrs = mixin.attrs
      , pp = this.pp;

    if (mixin.call) {
      if (pp) this.buf.push("__indent.push('" + Array(this.indents + 1).join('  ') + "');")
      if (block || attrs.length) {

        this.buf.push(name + '.call({');

        if (block) {
          this.buf.push('block: function(){');

          // Render block with no indents, dynamically added when rendered
          this.parentIndents++;
          var _indents = this.indents;
          this.indents = 0;
          this.visit(mixin.block);
          this.indents = _indents;
          this.parentIndents--;

          if (attrs.length) {
            this.buf.push('},');
          } else {
            this.buf.push('}');
          }
        }

        if (attrs.length) {
          var val = this.attrs(attrs);
          if (val.inherits) {
            this.buf.push('attributes: merge({' + val.buf
                + '}, attributes), escaped: merge(' + val.escaped + ', escaped, true)');
          } else {
            this.buf.push('attributes: {' + val.buf + '}, escaped: ' + val.escaped);
          }
        }

        if (args) {
          this.buf.push('}, ' + args + ');');
        } else {
          this.buf.push('});');
        }

      } else {
        this.buf.push(name + '(' + args + ');');
      }
      if (pp) this.buf.push("__indent.pop();")
    } else {
      this.buf.push('var ' + name + ' = function(' + args + '){');
      this.buf.push('var block = this.block, attributes = this.attributes || {}, escaped = this.escaped || {};');
      this.parentIndents++;
      this.visit(block);
      this.parentIndents--;
      this.buf.push('};');
    }
  },

  /**
   * Visit `tag` buffering tag markup, generating
   * attributes, visiting the `tag`'s code and block.
   *
   * @param {Tag} tag
   * @api public
   */

  visitTag: function(tag){
    this.indents++;
    var name = tag.name
      , pp = this.pp;

    if (tag.buffer) name = "' + (" + name + ") + '";

    if (!this.hasCompiledTag) {
      if (!this.hasCompiledDoctype && 'html' == name) {
        this.visitDoctype();
      }
      this.hasCompiledTag = true;
    }

    // pretty print
    if (pp && !tag.isInline())
      this.prettyIndent(0, true);

    if ((~selfClosing.indexOf(name) || tag.selfClosing) && !this.xml) {
      this.buffer('<' + name);
      this.visitAttributes(tag.attrs);
      this.terse
        ? this.buffer('>')
        : this.buffer('/>');
    } else {
      // Optimize attributes buffering
      if (tag.attrs.length) {
        this.buffer('<' + name);
        if (tag.attrs.length) this.visitAttributes(tag.attrs);
        this.buffer('>');
      } else {
        this.buffer('<' + name + '>');
      }
      if (tag.code) this.visitCode(tag.code);
      this.escape = 'pre' == tag.name;
      this.visit(tag.block);

      // pretty print
      if (pp && !tag.isInline() && 'pre' != tag.name && !tag.canInline())
        this.prettyIndent(0, true);

      this.buffer('</' + name + '>');
    }
    this.indents--;
  },

  /**
   * Visit `filter`, throwing when the filter does not exist.
   *
   * @param {Filter} filter
   * @api public
   */

  visitFilter: function(filter){
    var fn = filters[filter.name];

    // unknown filter
    if (!fn) throw new Error('unknown filter ":' + filter.name + '"');

    var text = filter.block.nodes.map(
      function(node){ return node.val; }
    ).join('\n');
    filter.attrs = filter.attrs || {};
    filter.attrs.filename = this.options.filename;
    this.buffer(utils.text(fn(text, filter.attrs)));
  },

  /**
   * Visit `text` node.
   *
   * @param {Text} text
   * @api public
   */

  visitText: function(text){
    text = utils.text(text.val.replace(/\\/g, '_SLASH_'));
    if (this.escape) text = escape(text);
    text = text.replace(/_SLASH_/g, '\\\\');
    this.buffer(text);
  },

  /**
   * Visit a `comment`, only buffering when the buffer flag is set.
   *
   * @param {Comment} comment
   * @api public
   */

  visitComment: function(comment){
    if (!comment.buffer) return;
    if (this.pp) this.prettyIndent(1, true);
    this.buffer('<!--' + utils.escape(comment.val) + '-->');
  },

  /**
   * Visit a `BlockComment`.
   *
   * @param {Comment} comment
   * @api public
   */

  visitBlockComment: function(comment){
    if (!comment.buffer) return;
    if (0 == comment.val.trim().indexOf('if')) {
      this.buffer('<!--[' + comment.val.trim() + ']>');
      this.visit(comment.block);
      this.buffer('<![endif]-->');
    } else {
      this.buffer('<!--' + comment.val);
      this.visit(comment.block);
      this.buffer('-->');
    }
  },

  /**
   * Visit `code`, respecting buffer / escape flags.
   * If the code is followed by a block, wrap it in
   * a self-calling function.
   *
   * @param {Code} code
   * @api public
   */

  visitCode: function(code){
    // Wrap code blocks with {}.
    // we only wrap unbuffered code blocks ATM
    // since they are usually flow control

    // Buffer code
    if (code.buffer) {
      var val = code.val.trimLeft();
      this.buf.push('var __val__ = ' + val);
      val = 'null == __val__ ? "" : __val__';
      if (code.escape) val = 'escape(' + val + ')';
      this.buf.push("buf.push(" + val + ");");
    } else {
      this.buf.push(code.val);
    }

    // Block support
    if (code.block) {
      if (!code.buffer) this.buf.push('{');
      this.visit(code.block);
      if (!code.buffer) this.buf.push('}');
    }
  },

  /**
   * Visit `each` block.
   *
   * @param {Each} each
   * @api public
   */

  visitEach: function(each){
    this.buf.push(''
      + '// iterate ' + each.obj + '\n'
      + ';(function(){\n'
      + '  if (\'number\' == typeof ' + each.obj + '.length) {\n');

    if (each.alternative) {
      this.buf.push('  if (' + each.obj + '.length) {');
    }

    this.buf.push(''
      + '    for (var ' + each.key + ' = 0, $$l = ' + each.obj + '.length; ' + each.key + ' < $$l; ' + each.key + '++) {\n'
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    this.buf.push('    }\n');

    if (each.alternative) {
      this.buf.push('  } else {');
      this.visit(each.alternative);
      this.buf.push('  }');
    }

    this.buf.push(''
      + '  } else {\n'
      + '    var $$l = 0;\n'
      + '    for (var ' + each.key + ' in ' + each.obj + ') {\n'
      + '      $$l++;'
      // if browser
      // + '      if (' + each.obj + '.hasOwnProperty(' + each.key + ')){'
      // end
      + '      var ' + each.val + ' = ' + each.obj + '[' + each.key + '];\n');

    this.visit(each.block);

    // if browser
    // this.buf.push('      }\n');
    // end

    this.buf.push('    }\n');
    if (each.alternative) {
      this.buf.push('    if ($$l === 0) {');
      this.visit(each.alternative);
      this.buf.push('    }');
    }
    this.buf.push('  }\n}).call(this);\n');
  },

  /**
   * Visit `attrs`.
   *
   * @param {Array} attrs
   * @api public
   */

  visitAttributes: function(attrs){
    var val = this.attrs(attrs);
    if (val.inherits) {
      this.buf.push("buf.push(attrs(merge({ " + val.buf +
          " }, attributes), merge(" + val.escaped + ", escaped, true)));");
    } else if (val.constant) {
      eval('var buf={' + val.buf + '};');
      this.buffer(runtime.attrs(buf, JSON.parse(val.escaped)), true);
    } else {
      this.buf.push("buf.push(attrs({ " + val.buf + " }, " + val.escaped + "));");
    }
  },

  /**
   * Compile attributes.
   */

  attrs: function(attrs){
    var buf = []
      , classes = []
      , escaped = {}
      , constant = attrs.every(function(attr){ return isConstant(attr.val) })
      , inherits = false;

    if (this.terse) buf.push('terse: true');

    attrs.forEach(function(attr){
      if (attr.name == 'attributes') return inherits = true;
      escaped[attr.name] = attr.escaped;
      if (attr.name == 'class') {
        classes.push('(' + attr.val + ')');
      } else {
        var pair = "'" + attr.name + "':(" + attr.val + ')';
        buf.push(pair);
      }
    });

    if (classes.length) {
      classes = classes.join(" + ' ' + ");
      buf.push('"class": ' + classes);
    }

    return {
      buf: buf.join(', '),
      escaped: JSON.stringify(escaped),
      inherits: inherits,
      constant: constant
    };
  }
};

/**
 * Check if expression can be evaluated to a constant
 *
 * @param {String} expression
 * @return {Boolean}
 * @api private
 */

function isConstant(val){
  // Check strings/literals
  if (/^ *("([^"\\]*(\\.[^"\\]*)*)"|'([^'\\]*(\\.[^'\\]*)*)'|true|false|null|undefined) *$/i.test(val))
    return true;

  // Check numbers
  if (!isNaN(Number(val)))
    return true;

  // Check arrays
  var matches;
  if (matches = /^ *\[(.*)\] *$/.exec(val))
    return matches[1].split(',').every(isConstant);

  return false;
}

/**
 * Escape the given string of `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
