/*!
 * Jade - Lexer
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var utils = require('./utils');

/**
 * Initialize `Lexer` with the given `str`.
 *
 * Options:
 *
 *   - `colons` allow colons for attr delimiters
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Lexer = module.exports = function Lexer(str, options) {
  options = options || {};
  this.input = str.replace(/\r\n|\r/g, '\n');
  this.colons = options.colons;
  this.deferredTokens = [];
  this.lastIndents = 0;
  this.lineno = 1;
  this.stash = [];
  this.indentStack = [];
  this.indentRe = null;
  this.pipeless = false;
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  
  /**
   * Construct a token with the given `type` and `val`.
   *
   * @param {String} type
   * @param {String} val
   * @return {Object}
   * @api private
   */
  
  tok: function(type, val){
    return {
        type: type
      , line: this.lineno
      , val: val
    }
  },
  
  /**
   * Consume the given `len` of input.
   *
   * @param {Number} len
   * @api private
   */
  
  consume: function(len){
    this.input = this.input.substr(len);
  },
  
  /**
   * Scan for `type` with the given `regexp`.
   *
   * @param {String} type
   * @param {RegExp} regexp
   * @return {Object}
   * @api private
   */
  
  scan: function(regexp, type){
    var captures;
    if (captures = regexp.exec(this.input)) {
      this.consume(captures[0].length);
      return this.tok(type, captures[1]);
    }
  },
  
  /**
   * Defer the given `tok`.
   *
   * @param {Object} tok
   * @api private
   */
  
  defer: function(tok){
    this.deferredTokens.push(tok);
  },
  
  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */
  
  lookahead: function(n){
    var fetch = n - this.stash.length;
    while (fetch-- > 0) this.stash.push(this.next());
    return this.stash[--n];
  },
  
  /**
   * Return the indexOf `start` / `end` delimiters.
   *
   * @param {String} start
   * @param {String} end
   * @return {Number}
   * @api private
   */
  
  indexOfDelimiters: function(start, end){
    var str = this.input
      , nstart = 0
      , nend = 0
      , pos = 0;
    for (var i = 0, len = str.length; i < len; ++i) {
      if (start == str.charAt(i)) {
        ++nstart;
      } else if (end == str.charAt(i)) {
        if (++nend == nstart) {
          pos = i;
          break;
        }
      }
    }
    return pos;
  },
  
  /**
   * Stashed token.
   */
  
  stashed: function() {
    return this.stash.length
      && this.stash.shift();
  },
  
  /**
   * Deferred token.
   */
  
  deferred: function() {
    return this.deferredTokens.length 
      && this.deferredTokens.shift();
  },
  
  /**
   * end-of-source.
   */
  
  eos: function() {
    if (this.input.length) return;
    if (this.indentStack.length) {
      this.indentStack.shift();
      return this.tok('outdent');
    } else {
      return this.tok('eos');
    }
  },

  /**
   * Blank line.
   */
  
  blank: function() {
    var captures;
    if (captures = /^\n *\n/.exec(this.input)) {
      this.consume(captures[0].length - 1);
      ++this.lineno;
      if (this.pipeless) return this.tok('text', '');
      return this.next();
    }
  },

  /**
   * Comment.
   */
  
  comment: function() {
    var captures;
    if (captures = /^ *\/\/(-)?([^\n]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('comment', captures[2]);
      tok.buffer = '-' != captures[1];
      return tok;
    }
  },

  /**
   * Interpolated tag.
   */

  interpolation: function() {
    var captures;
    if (captures = /^#\{(.*?)\}/.exec(this.input)) {
      this.consume(captures[0].length);
      return this.tok('interpolation', captures[1]);
    }
  },

  /**
   * Tag.
   */
  
  tag: function() {
    var captures;
    if (captures = /^(\w[-:\w]*)(\/?)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok, name = captures[1];
      if (':' == name[name.length - 1]) {
        name = name.slice(0, -1);
        tok = this.tok('tag', name);
        this.defer(this.tok(':'));
        while (' ' == this.input[0]) this.input = this.input.substr(1);
      } else {
        tok = this.tok('tag', name);
      }
      tok.selfClosing = !! captures[2];
      return tok;
    }
  },
  
  /**
   * Filter.
   */
  
  filter: function() {
    return this.scan(/^:(\w+)/, 'filter');
  },
  
  /**
   * Doctype.
   */
  
  doctype: function() {
    return this.scan(/^(?:!!!|doctype) *([^\n]+)?/, 'doctype');
  },

  /**
   * Id.
   */
  
  id: function() {
    return this.scan(/^#([\w-]+)/, 'id');
  },
  
  /**
   * Class.
   */
  
  className: function() {
    return this.scan(/^\.([\w-]+)/, 'class');
  },
  
  /**
   * Text.
   */
  
  text: function() {
    return this.scan(/^(?:\| ?| ?)?([^\n]+)/, 'text');
  },

  /**
   * Extends.
   */
  
  "extends": function() {
    return this.scan(/^extends? +([^\n]+)/, 'extends');
  },

  /**
   * Block prepend.
   */
  
  prepend: function() {
    var captures;
    if (captures = /^prepend +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = 'prepend'
        , name = captures[1]
        , tok = this.tok('block', name);
      tok.mode = mode;
      return tok;
    }
  },
  
  /**
   * Block append.
   */
  
  append: function() {
    var captures;
    if (captures = /^append +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = 'append'
        , name = captures[1]
        , tok = this.tok('block', name);
      tok.mode = mode;
      return tok;
    }
  },

  /**
   * Block.
   */
  
  block: function() {
    var captures;
    if (captures = /^block\b *(?:(prepend|append) +)?([^\n]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var mode = captures[1] || 'replace'
        , name = captures[2]
        , tok = this.tok('block', name);

      tok.mode = mode;
      return tok;
    }
  },

  /**
   * Yield.
   */
  
  yield: function() {
    return this.scan(/^yield */, 'yield');
  },

  /**
   * Include.
   */
  
  include: function() {
    return this.scan(/^include +([^\n]+)/, 'include');
  },

  /**
   * Case.
   */
  
  "case": function() {
    return this.scan(/^case +([^\n]+)/, 'case');
  },

  /**
   * When.
   */
  
  when: function() {
    return this.scan(/^when +([^:\n]+)/, 'when');
  },

  /**
   * Default.
   */
  
  "default": function() {
    return this.scan(/^default */, 'default');
  },

  /**
   * Assignment.
   */
  
  assignment: function() {
    var captures;
    if (captures = /^(\w+) += *([^;\n]+)( *;? *)/.exec(this.input)) {
      this.consume(captures[0].length);
      var name = captures[1]
        , val = captures[2];
      return this.tok('code', 'var ' + name + ' = (' + val + ');');
    }
  },

  /**
   * Call mixin.
   */
  
  call: function(){
    var captures;
    if (captures = /^\+([-\w]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('call', captures[1]);
      
      // Check for args (not attributes)
      if (captures = /^ *\((.*?)\)/.exec(this.input)) {
        if (!/^ *[-\w]+ *=/.test(captures[1])) {
          this.consume(captures[0].length);
          tok.args = captures[1];
        }
      }
      
      return tok;
    }
  },

  /**
   * Mixin.
   */

  mixin: function(){
    var captures;
    if (captures = /^mixin +([-\w]+)(?: *\((.*)\))?/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('mixin', captures[1]);
      tok.args = captures[2];
      return tok;
    }
  },

  /**
   * Conditional.
   */
  
  conditional: function() {
    var captures;
    if (captures = /^(if|unless|else if|else)\b([^\n]*)/.exec(this.input)) {
      this.consume(captures[0].length);
      var type = captures[1]
        , js = captures[2];

      switch (type) {
        case 'if': js = 'if (' + js + ')'; break;
        case 'unless': js = 'if (!(' + js + '))'; break;
        case 'else if': js = 'else if (' + js + ')'; break;
        case 'else': js = 'else'; break;
      }

      return this.tok('code', js);
    }
  },

  /**
   * While.
   */
  
  "while": function() {
    var captures;
    if (captures = /^while +([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      return this.tok('code', 'while (' + captures[1] + ')');
    }
  },

  /**
   * Each.
   */
  
  each: function() {
    var captures;
    if (captures = /^(?:- *)?(?:each|for) +(\w+)(?: *, *(\w+))? * in *([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var tok = this.tok('each', captures[1]);
      tok.key = captures[2] || '$index';
      tok.code = captures[3];
      return tok;
    }
  },
  
  /**
   * Code.
   */
  
  code: function() {
    var captures;
    if (captures = /^(!?=|-)([^\n]+)/.exec(this.input)) {
      this.consume(captures[0].length);
      var flags = captures[1];
      captures[1] = captures[2];
      var tok = this.tok('code', captures[1]);
      tok.escape = flags.charAt(0) === '=';
      tok.buffer = flags.charAt(0) === '=' || flags.charAt(1) === '=';
      return tok;
    }
  },
  
  /**
   * Attributes.
   */
  
  attrs: function() {
    if ('(' == this.input.charAt(0)) {
      var index = this.indexOfDelimiters('(', ')')
        , str = this.input.substr(1, index-1)
        , tok = this.tok('attrs')
        , len = str.length
        , colons = this.colons
        , states = ['key']
        , escapedAttr
        , key = ''
        , val = ''
        , quote
        , c
        , p;

      function state(){
        return states[states.length - 1];
      }

      function interpolate(attr) {
        return attr.replace(/(\\)?#\{([^}]+)\}/g, function(_, escape, expr){
          return escape
             ? _
             : quote + " + (" + expr + ") + " + quote;
        });
      }

      this.consume(index + 1);
      tok.attrs = {};
      tok.escaped = {};

      function parse(c) {
        var real = c;
        // TODO: remove when people fix ":"
        if (colons && ':' == c) c = '=';
        switch (c) {
          case ',':
          case '\n':
            switch (state()) {
              case 'expr':
              case 'array':
              case 'string':
              case 'object':
                val += c;
                break;
              default:
                states.push('key');
                val = val.trim();
                key = key.trim();
                if ('' == key) return;
                key = key.replace(/^['"]|['"]$/g, '').replace('!', '');
                tok.escaped[key] = escapedAttr;
                tok.attrs[key] = '' == val
                  ? true
                  : interpolate(val);
                key = val = '';
            }
            break;
          case '=':
            switch (state()) {
              case 'key char':
                key += real;
                break;
              case 'val':
              case 'expr':
              case 'array':
              case 'string':
              case 'object':
                val += real;
                break;
              default:
                escapedAttr = '!' != p;
                states.push('val');
            }
            break;
          case '(':
            if ('val' == state()
              || 'expr' == state()) states.push('expr');
            val += c;
            break;
          case ')':
            if ('expr' == state()
              || 'val' == state()) states.pop();
            val += c;
            break;
          case '{':
            if ('val' == state()) states.push('object');
            val += c;
            break;
          case '}':
            if ('object' == state()) states.pop();
            val += c;
            break;
          case '[':
            if ('val' == state()) states.push('array');
            val += c;
            break;
          case ']':
            if ('array' == state()) states.pop();
            val += c;
            break;
          case '"':
          case "'":
            switch (state()) {
              case 'key':
                states.push('key char');
                break;
              case 'key char':
                states.pop();
                break;
              case 'string':
                if (c == quote) states.pop();
                val += c;
                break;
              default:
                states.push('string');
                val += c;
                quote = c;
            }
            break;
          case '':
            break;
          default:
            switch (state()) {
              case 'key':
              case 'key char':
                key += c;
                break;
              default:
                val += c;
            }
        }
        p = c;
      }

      for (var i = 0; i < len; ++i) {
        parse(str.charAt(i));
      }

      parse(',');

      if ('/' == this.input.charAt(0)) {
        this.consume(1);
        tok.selfClosing = true;
      }

      return tok;
    }
  },
  
  /**
   * Indent | Outdent | Newline.
   */
  
  indent: function() {
    var captures, re;

    // established regexp
    if (this.indentRe) {
      captures = this.indentRe.exec(this.input);
    // determine regexp
    } else {
      // tabs
      re = /^\n(\t*) */;
      captures = re.exec(this.input);

      // spaces
      if (captures && !captures[1].length) {
        re = /^\n( *)/;
        captures = re.exec(this.input);
      }

      // established
      if (captures && captures[1].length) this.indentRe = re;
    }

    if (captures) {
      var tok
        , indents = captures[1].length;

      ++this.lineno;
      this.consume(indents + 1);

      if (' ' == this.input[0] || '\t' == this.input[0]) {
        throw new Error('Invalid indentation, you can use tabs or spaces but not both');
      }

      // blank line
      if ('\n' == this.input[0]) return this.tok('newline');

      // outdent
      if (this.indentStack.length && indents < this.indentStack[0]) {
        while (this.indentStack.length && this.indentStack[0] > indents) {
          this.stash.push(this.tok('outdent'));
          this.indentStack.shift();
        }
        tok = this.stash.pop();
      // indent
      } else if (indents && indents != this.indentStack[0]) {
        this.indentStack.unshift(indents);
        tok = this.tok('indent', indents);
      // newline
      } else {
        tok = this.tok('newline');
      }

      return tok;
    }
  },

  /**
   * Pipe-less text consumed only when 
   * pipeless is true;
   */

  pipelessText: function() {
    if (this.pipeless) {
      if ('\n' == this.input[0]) return;
      var i = this.input.indexOf('\n');
      if (-1 == i) i = this.input.length;
      var str = this.input.substr(0, i);
      this.consume(str.length);
      return this.tok('text', str);
    }
  },

  /**
   * ':'
   */

  colon: function() {
    return this.scan(/^: */, ':');
  },

  /**
   * Return the next token object, or those
   * previously stashed by lookahead.
   *
   * @return {Object}
   * @api private
   */
  
  advance: function(){
    return this.stashed()
      || this.next();
  },
  
  /**
   * Return the next token object.
   *
   * @return {Object}
   * @api private
   */
  
  next: function() {
    return this.deferred()
      || this.blank()
      || this.eos()
      || this.pipelessText()
      || this.yield()
      || this.doctype()
      || this.interpolation()
      || this["case"]()
      || this.when()
      || this["default"]()
      || this["extends"]()
      || this.append()
      || this.prepend()
      || this.block()
      || this.include()
      || this.mixin()
      || this.call()
      || this.conditional()
      || this.each()
      || this["while"]()
      || this.assignment()
      || this.tag()
      || this.filter()
      || this.code()
      || this.id()
      || this.className()
      || this.attrs()
      || this.indent()
      || this.comment()
      || this.colon()
      || this.text();
  }
};
