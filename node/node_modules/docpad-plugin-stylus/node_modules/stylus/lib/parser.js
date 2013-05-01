
/*!
 * Stylus - Parser
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer')
  , nodes = require('./nodes')
  , Token = require('./token')
  , inspect = require('util').inspect
  , errors = require('./errors');

// debuggers

var debug = {
    lexer: require('debug')('stylus:lexer')
  , selector: require('debug')('stylus:parser:selector')
};

/**
 * Selector composite tokens.
 */

var selectorTokens = [
    'ident'
  , 'string'
  , 'selector'
  , 'function'
  , 'comment'
  , 'boolean'
  , 'space'
  , 'color'
  , 'unit'
  , 'for'
  , 'in'
  , '['
  , ']'
  , '('
  , ')'
  , '+'
  , '-'
  , '*'
  , '*='
  , '<'
  , '>'
  , '='
  , ':'
  , '&'
  , '~'
  , '{'
  , '}'
];

/**
 * CSS3 pseudo-selectors.
 */

var pseudoSelectors = [
    'root'
  , 'nth-child'
  , 'nth-last-child'
  , 'nth-of-type'
  , 'nth-last-of-type'
  , 'first-child'
  , 'last-child'
  , 'first-of-type'
  , 'last-of-type'
  , 'only-child'
  , 'only-of-type'
  , 'empty'
  , 'link'
  , 'visited'
  , 'active'
  , 'hover'
  , 'focus'
  , 'target'
  , 'lang'
  , 'enabled'
  , 'disabled'
  , 'checked'
  , 'not'
];

/**
 * Initialize a new `Parser` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Parser = module.exports = function Parser(str, options) {
  var self = this;
  options = options || {};
  this.lexer = new Lexer(str, options);
  this.root = options.root || new nodes.Root;
  this.state = ['root'];
  this.stash = [];
  this.parens = 0;
  this.css = 0;
  this.state.pop = function(){
    self.prevState = [].pop.call(this);
  };
};

/**
 * Parser prototype.
 */

Parser.prototype = {

  /**
   * Constructor.
   */

  constructor: Parser,

  /**
   * Return current state.
   *
   * @return {String}
   * @api private
   */

  currentState: function() {
    return this.state[this.state.length - 1];
  },

  /**
   * Parse the input, then return the root node.
   *
   * @return {Node}
   * @api private
   */

  parse: function(){
    var block = this.parent = this.root;
    while ('eos' != this.peek().type) {
      if (this.accept('newline')) continue;
      var stmt = this.statement();
      this.accept(';');
      if (!stmt) this.error('unexpected token {peek}, not allowed at the root level');
      block.push(stmt);
    }
    return block;
  },

  /**
   * Throw an `Error` with the given `msg`.
   *
   * @param {String} msg
   * @api private
   */

  error: function(msg){
    var type = this.peek().type
      , val = undefined == this.peek().val
        ? ''
        : ' ' + this.peek().toString();
    if (val.trim() == type.trim()) val = '';
    throw new errors.ParseError(msg.replace('{peek}', '"' + type + val + '"'));
  },

  /**
   * Accept the given token `type`, and return it,
   * otherwise return `undefined`.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  accept: function(type){
    if (type == this.peek().type) {
      return this.next();
    }
  },

  /**
   * Expect token `type` and return it, throw otherwise.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  expect: function(type){
    if (type != this.peek().type) {
      this.error('expected "' + type + '", got {peek}');
    }
    return this.next();
  },

  /**
   * Get the next token.
   *
   * @return {Token}
   * @api private
   */

  next: function() {
    var tok = this.stash.length
      ? this.stash.pop()
      : this.lexer.next();
    nodes.lineno = tok.lineno;
    debug.lexer('%s %s', tok.type, tok.val || '');
    return tok;
  },

  /**
   * Peek with lookahead(1).
   *
   * @return {Token}
   * @api private
   */

  peek: function() {
    return this.lexer.peek();
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Token}
   * @api private
   */

  lookahead: function(n){
    return this.lexer.lookahead(n);
  },

  /**
   * Check if the token at `n` is a valid selector token.
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */

  isSelectorToken: function(n) {
    var la = this.lookahead(n).type;
    switch (la) {
      case 'for':
        return this.bracketed;
      case '[':
        this.bracketed = true;
        return true;
      case ']':
        this.bracketed = false;
        return true;
      default:
        return ~selectorTokens.indexOf(la);
    }
  },

  /**
   * Check if the token at `n` is a pseudo selector.
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */

  isPseudoSelector: function(n){
    return ~pseudoSelectors.indexOf(this.lookahead(n).val.name);
  },

  /**
   * Check if the current line contains `type`.
   *
   * @param {String} type
   * @return {Boolean}
   * @api private
   */

  lineContains: function(type){
    var i = 1
      , la;

    while (la = this.lookahead(i++)) {
      if (~['indent', 'outdent', 'newline'].indexOf(la.type)) return;
      if (type == la.type) return true;
    }
  },

  /**
   * Valid selector tokens.
   */

  selectorToken: function() {
    if (this.isSelectorToken(1)) {
      if ('{' == this.peek().type) {
        // unclosed, must be a block
        if (!this.lineContains('}')) return;
        // check if ':' is within the braces.
        // though not required by stylus, chances
        // are if someone is using {} they will
        // use css-style props, helping us with
        // the ambiguity in this case
        var i = 0
          , la;
        while (la = this.lookahead(++i)) {
          if ('}' == la.type) break;
          if (':' == la.type) return;
        }
      }
      return this.next();
    }
  },

  /**
   * Consume whitespace.
   */

  skipWhitespace: function() {
    while (~['space', 'indent', 'outdent', 'newline'].indexOf(this.peek().type))
      this.next();
  },

  /**
   * Consume newlines.
   */

  skipNewlines: function() {
    while ('newline' == this.peek().type)
      this.next();
  },

  /**
   * Consume spaces.
   */

  skipSpaces: function() {
    while ('space' == this.peek().type)
      this.next();
  },

  /**
   * Check if the following sequence of tokens
   * forms a function definition, ie trailing
   * `{` or indentation.
   */

  looksLikeFunctionDefinition: function(i) {
    return 'indent' == this.lookahead(i).type
      || '{' == this.lookahead(i).type;
  },

  /**
   * Check if the following sequence of tokens
   * forms a selector.
   */

  looksLikeSelector: function() {
    var i = 1
      , brace;

    // Assume selector when an ident is
    // followed by a selector
    while ('ident' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type) i += 2;

    while (this.isSelectorToken(i)
      || ',' == this.lookahead(i).type) {

      if ('selector' == this.lookahead(i).type)
        return true;

      // the ':' token within braces signifies
      // a selector. ex: "foo{bar:'baz'}"
      if ('{' == this.lookahead(i).type) brace = true;
      else if ('}' == this.lookahead(i).type) brace = false;
      if (brace && ':' == this.lookahead(i).type) return true;

      // '}' preceded by a space is considered a selector.
      // for example "foo{bar}{baz}" may be a property,
      // however "foo{bar} {baz}" is a selector
      if ('space' == this.lookahead(i).type
        && '{' == this.lookahead(i + 1).type)
        return true;

      // Assume pseudo selectors are NOT properties
      // as 'td:th-child(1)' may look like a property
      // and function call to the parser otherwise
      if (':' == this.lookahead(i++).type
        && !this.lookahead(i-1).space
        && this.isPseudoSelector(i))
        return true;

      if (',' == this.lookahead(i).type
        && 'newline' == this.lookahead(i + 1).type)
        return true;
    }

    // Trailing comma
    if (',' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // Trailing brace
    if ('{' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // css-style mode, false on ; }
    if (this.css) {
      if (';' == this.lookahead(i) ||
          '}' == this.lookahead(i))
        return false;
    }

    // Trailing separators
    while (!~[
        'indent'
      , 'outdent'
      , 'newline'
      , 'for'
      , 'if'
      , ';'
      , '}'
      , 'eos'].indexOf(this.lookahead(i).type))
      ++i;

    if ('indent' == this.lookahead(i).type)
      return true;
  },

  /**
   * Check if the current state supports selectors.
   */

  stateAllowsSelector: function() {
    switch (this.currentState()) {
      case 'root':
      case 'selector':
      case 'conditional':
      case 'keyframe':
      case 'function':
      case 'font-face':
      case 'media':
      case '-moz-document':
      case 'for':
        return true;
    }
  },

  /**
   *   statement
   * | statement 'if' expression
   * | statement 'unless' expression
   */

  statement: function() {
    var stmt = this.stmt()
      , state = this.prevState
      , block
      , op;

    // special-case statements since it
    // is not an expression. We could
    // implement postfix conditionals at
    // the expression level, however they
    // would then fail to enclose properties
    if (this.allowPostfix) {
      delete this.allowPostfix;
      state = 'expression';
    }

    switch (state) {
      case 'assignment':
      case 'expression':
      case 'function arguments':
        while (op =
             this.accept('if')
          || this.accept('unless')
          || this.accept('for')) {
          switch (op.type) {
            case 'if':
            case 'unless':
              stmt = new nodes.If(this.expression(), stmt);
              stmt.postfix = true;
              stmt.negate = 'unless' == op.type;
              this.accept(';');
              break;
            case 'for':
              var key
                , val = this.id().name;
              if (this.accept(',')) key = this.id().name;
              this.expect('in');
              var each = new nodes.Each(val, key, this.expression());
              block = new nodes.Block;
              block.push(stmt);
              each.block = block;
              stmt = each;
          }
        }
    }

    return stmt;
  },

  /**
   *    ident
   *  | selector
   *  | literal
   *  | charset
   *  | import
   *  | media
   *  | scope
   *  | keyframes
   *  | page
   *  | for
   *  | if
   *  | unless
   *  | comment
   *  | expression
   *  | 'return' expression
   */

  stmt: function() {
    var type = this.peek().type;
    switch (type) {
      case '-webkit-keyframes':
      case 'keyframes':
        return this.keyframes();
      case 'font-face':
        return this.fontface();
      case '-moz-document':
        return this.mozdocument();
      case 'comment':
      case 'selector':
      case 'literal':
      case 'charset':
      case 'import':
      case 'extend':
      case 'media':
      case 'page':
      case 'ident':
      case 'scope':
      case 'unless':
      case 'function':
      case 'for':
      case 'if':
        return this[type]();
      case 'return':
        return this.return();
      case '{':
        return this.property();
      default:
        // Contextual selectors
        if (this.stateAllowsSelector()) {
          switch (type) {
            case 'color':
            case '~':
            case '+':
            case '>':
            case '<':
            case ':':
            case '&':
            case '[':
              return this.selector();
            case '*':
              return this.property();
            case '-':
              if ('{' == this.lookahead(2).type)
                return this.property();
          }
        }

        // Expression fallback
        var expr = this.expression();
        if (expr.isEmpty) this.error('unexpected {peek}');
        return expr;
    }
  },

  /**
   * indent (!outdent)+ outdent
   */

  block: function(node, scope) {
    var delim
      , stmt
      , block = this.parent = new nodes.Block(this.parent, node);

    if (false === scope) block.scope = false;

    // css-style
    if (this.accept('{')) {
      this.css++;
      delim = '}';
      this.skipWhitespace();
    } else {
      delim = 'outdent';
      this.expect('indent');
    }

    while (delim != this.peek().type) {
      // css-style
      if (this.css) {
        if (this.accept('newline')) continue;
        stmt = this.statement();
        this.accept(';');
        this.skipWhitespace();
      } else {
        if (this.accept('newline')) continue;
        stmt = this.statement();
        this.accept(';');
      }
      if (!stmt) this.error('unexpected token {peek} in block');
      block.push(stmt);
    }

    // css-style
    if (this.css) {
      this.skipWhitespace();
      this.expect('}');
      this.skipSpaces();
      this.css--;
    } else {
      this.expect('outdent');
    }

    this.parent = block.parent;
    return block;
  },

  /**
   * comment space*
   */

  comment: function(){
    var node = this.next().val;
    this.skipSpaces();
    return node;
  },

  /**
   * for val (',' key) in expr
   */

  for: function() {
    this.expect('for');
    var key
      , val = this.id().name;
    if (this.accept(',')) key = this.id().name;
    this.expect('in');
    var each = new nodes.Each(val, key, this.expression());
    this.state.push('for');
    each.block = this.block(each, false);
    this.state.pop();
    return each;
  },

  /**
   * return expression
   */

  return: function() {
    this.expect('return');
    var expr = this.expression();
    return expr.isEmpty
      ? new nodes.Return
      : new nodes.Return(expr);
  },

  /**
   * unless expression block
   */

  unless: function() {
    this.expect('unless');
    var node = new nodes.If(this.expression(), true);
    this.state.push('conditional');
    node.block = this.block(node, false);
    this.state.pop();
    return node;
  },

  /**
   * if expression block (else block)?
   */

  if: function() {
    this.expect('if');
    var node = new nodes.If(this.expression());
    this.state.push('conditional');
    node.block = this.block(node, false);
    while (this.accept('else')) {
      if (this.accept('if')) {
        var cond = this.expression()
          , block = this.block(node, false);
        node.elses.push(new nodes.If(cond, block));
      } else {
        node.elses.push(this.block(node, false));
        break;
      }
    }
    this.state.pop();
    return node;
  },

  /**
   * scope
   */

  scope: function(){
    var val = this.expect('scope').val;
    this.selectorScope = val;
    return nodes.null;
  },

  /**
   * extend
   */

  extend: function(){
    var val = this.expect('extend').val
      , arr = this.selectorParts();

    arr.unshift(new nodes.Literal(val));

    return new nodes.Extend(new nodes.Selector(arr));
  },

  /**
   * media
   */

  media: function() {
    var val = this.expect('media').val
      , media = new nodes.Media(val);
    this.state.push('media');
    media.block = this.block(media);
    this.state.pop();
    return media;
  },

  /**
   * @-moz-document block
   */

  mozdocument: function(){
    var val = this.expect('-moz-document').val
      , mozdocument = new nodes.MozDocument(val);
    this.state.push('-moz-document');
    mozdocument.block = this.block(mozdocument, false);
    this.state.pop();
    return mozdocument;
  },

  /**
   * fontface
   */

  fontface: function() {
    this.expect('font-face');
    var node = new nodes.FontFace;
    this.state.push('font-face');
    node.block = this.block(node);
    this.state.pop();
    return node;
  },

  /**
   * import expression
   */

  import: function() {
    this.expect('import');
    this.allowPostfix = true;
    return new nodes.Import(this.expression());
  },

  /**
   * charset string
   */

  charset: function() {
    this.expect('charset');
    var str = this.expect('string').val;
    this.allowPostfix = true;
    return new nodes.Charset(str);
  },

  /**
   * page selector? block
   */

  page: function() {
    var selector;
    this.expect('page');
    if (this.accept(':')) {
      var str = this.expect('ident').val.name;
      selector = new nodes.Literal(':' + str);
    }
    var page = new nodes.Page(selector);
    this.skipSpaces();
    this.state.push('page');
    page.block = this.block(page);
    this.state.pop();
    return page;
  },

  /**
   * keyframes name (
   *  (unit | from | to)
   *  (',' (unit | from | to)*)
   *  block)+
   */

  keyframes: function() {
    var pos
      , tok = this.expect('keyframes')
      , keyframes = new nodes.Keyframes(this.id(), tok.val)
      , vals = [];

    // css-style
    if (this.accept('{')) {
      this.css++;
      this.skipWhitespace();
    } else {
      this.expect('indent');
    }

    this.skipNewlines();

    while (pos = this.accept('unit') || this.accept('ident')) {
      // from | to
      if ('ident' == pos.type) {
        this.accept('space');
        switch (pos.val.name) {
          case 'from':
            pos = new nodes.Unit(0, '%');
            break;
          case 'to':
            pos = new nodes.Unit(100, '%');
            break;
          default:
            this.error('"' + pos.val.name + '" is invalid, use "from" or "to"');
        }
      } else {
        pos = pos.val;
      }

      vals.push(pos);

      // ','
      if (this.accept(',') || this.accept('newline')) continue;

      // block
      this.state.push('keyframe');
      var block = this.block(keyframes);
      keyframes.push(vals, block);
      vals = [];
      this.state.pop();
      if (this.css) this.skipWhitespace();
      this.skipNewlines();
    }

    // css-style
    if (this.css) {
      this.skipWhitespace();
      this.expect('}');
      this.css--;
    } else {
      this.expect('outdent');
    }

    return keyframes;
  },

  /**
   * literal
   */

  literal: function() {
    return this.expect('literal').val;
  },

  /**
   * ident space?
   */

  id: function() {
    var tok = this.expect('ident');
    this.accept('space');
    return tok.val;
  },

  /**
   *   ident
   * | assignment
   * | property
   * | selector
   */

  ident: function() {
    var i = 2
      , la = this.lookahead(i).type;

    while ('space' == la) la = this.lookahead(++i).type;

    switch (la) {
      // Assignment
      case '=':
      case '?=':
      case '-=':
      case '+=':
      case '*=':
      case '/=':
      case '%=':
        return this.assignment();
      // Assignment []=
      case '[':
        if (this._ident == this.peek()) return this.id();
        while (']' != this.lookahead(i++).type
          && 'selector' != this.lookahead(i).type) ;
        if ('=' == this.lookahead(i).type) {
          this._ident = this.peek();
          return this.expression();
        } else if (this.looksLikeSelector() && this.stateAllowsSelector()) {
          return this.selector();
        }
      // Operation
      case '-':
      case '+':
      case '/':
      case '*':
      case '%':
      case '**':
      case 'and':
      case 'or':
      case '&&':
      case '||':
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '!=':
      case '==':
      case '?':
      case 'in':
      case 'is a':
      case 'is defined':
        // Prevent cyclic .ident, return literal
        if (this._ident == this.peek()) {
          return this.id();
        } else {
          this._ident = this.peek();
          switch (this.currentState()) {
            // unary op or selector in property / for
            case 'for':
            case 'selector':
              return this.property();
            // Part of a selector
            case 'root':
            case 'media':
            case '-moz-document':
            case 'font-face':
              return this.selector();
            case 'function':
              return this.looksLikeSelector()
                ? this.selector()
                : this.expression();
            // Do not disrupt the ident when an operand
            default:
              return this.operand
                ? this.id()
                : this.expression();
          }
        }
      // Selector or property
      default:
        switch (this.currentState()) {
          case 'root':
            return this.selector();
          case 'for':
          case 'page':
          case 'media':
          case '-moz-document':
          case 'font-face':
          case 'selector':
          case 'function':
          case 'keyframe':
          case 'conditional':
            return this.property();
          default:
            return this.id();
        }
    }
  },

  /**
   * '*'? (ident | '{' expression '}')+
   */

  interpolate: function() {
    var node
      , segs = []
      , star;

    star = this.accept('*');
    if (star) segs.push(new nodes.Literal('*'));

    while (true) {
      if (this.accept('{')) {
        this.state.push('interpolation');
        segs.push(this.expression());
        this.expect('}');
        this.state.pop();
      } else if (node = this.accept('-')){
        segs.push(new nodes.Literal('-'));
      } else if (node = this.accept('ident')){
        segs.push(node.val);
      } else {
        break;
      }
    }
    if (!segs.length) this.expect('ident');
    return segs;
  },

  /**
   *   property ':'? expression
   * | ident
   */

  property: function() {
    if (this.looksLikeSelector()) return this.selector();

    // property
    var ident = this.interpolate()
      , prop = new nodes.Property(ident)
      , ret = prop;

    // optional ':'
    this.accept('space');
    if (this.accept(':')) this.accept('space');

    this.state.push('property');
    this.inProperty = true;
    prop.expr = this.list();
    if (prop.expr.isEmpty) ret = ident[0];
    this.inProperty = false;
    this.allowPostfix = true;
    this.state.pop();

    // optional ';'
    this.accept(';');

    return ret;
  },

  /**
   *   selector ',' selector
   * | selector newline selector
   * | selector block
   */

  selector: function() {
    var arr
      , group = new nodes.Group
      , scope = this.selectorScope
      , isRoot = 'root' == this.currentState();

    do {
      // Clobber newline after ,
      this.accept('newline');

      arr = this.selectorParts();

      // Push the selector
      if (isRoot && scope) arr.unshift(new nodes.Literal(scope + ' '));
      group.push(new nodes.Selector(arr));
    } while (this.accept(',') || this.accept('newline'));

    this.state.push('selector');
    group.block = this.block(group);
    this.state.pop();

    return group;
  },

  selectorParts: function(){
    var tok
      , arr = [];

    // Selector candidates,
    // stitched together to
    // form a selector.
    while (tok = this.selectorToken()) {
      debug.selector('%s', tok);
      // Selector component
      switch (tok.type) {
        case '{':
          this.skipSpaces();
          var expr = this.expression();
          this.skipSpaces();
          this.expect('}');
          arr.push(expr);
          break;
        case 'comment':
          arr.push(new nodes.Literal(tok.val.str));
          break;
        case 'color':
          arr.push(new nodes.Literal(tok.val.raw));
          break;
        case 'space':
          arr.push(new nodes.Literal(' '));
          break;
        case 'function':
          arr.push(new nodes.Literal(tok.val.name + '('));
          break;
        case 'ident':
          arr.push(new nodes.Literal(tok.val.name));
          break;
        default:
          arr.push(new nodes.Literal(tok.val));
          if (tok.space) arr.push(new nodes.Literal(' '));
      }
    }

    return arr;
  },

  /**
   * ident ('=' | '?=') expression
   */

  assignment: function() {
    var op
      , node
      , name = this.id().name;

    if (op =
         this.accept('=')
      || this.accept('?=')
      || this.accept('+=')
      || this.accept('-=')
      || this.accept('*=')
      || this.accept('/=')
      || this.accept('%=')) {
      this.state.push('assignment');
      var expr = this.list();
      if (expr.isEmpty) this.error('invalid right-hand side operand in assignment, got {peek}')
      node = new nodes.Ident(name, expr);
      this.state.pop();

      switch (op.type) {
        case '?=':
          var defined = new nodes.BinOp('is defined', node)
            , lookup = new nodes.Ident(name);
          node = new nodes.Ternary(defined, lookup, node);
          break;
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
          node.val = new nodes.BinOp(op.type[0], new nodes.Ident(name), expr);
          break;
      }
    }

    return node;
  },

  /**
   *   definition
   * | call
   */

  function: function() {
    var parens = 1
      , i = 2
      , tok;

    // Lookahead and determine if we are dealing
    // with a function call or definition. Here
    // we pair parens to prevent false negatives
    out:
    while (tok = this.lookahead(i++)) {
      switch (tok.type) {
        case 'function':
        case '(':
          ++parens;
          break;
        case ')':
          if (!--parens) break out;
          break;
        case 'eos':
          this.error('failed to find closing paren ")"');
      }
    }

    // Definition or call
    switch (this.currentState()) {
      case 'expression':
        return this.functionCall();
      default:
        return this.looksLikeFunctionDefinition(i)
          ? this.functionDefinition()
          : this.expression();
    }
  },

  /**
   * url '(' (expression | urlchars)+ ')'
   */

  url: function() {
    this.expect('function');
    this.state.push('function arguments');
    var args = this.args();
    this.expect(')');
    this.state.pop();
    return new nodes.Call('url', args);
  },

  /**
   * ident '(' expression ')'
   */

  functionCall: function() {
    if ('url' == this.peek().val.name) return this.url();
    var name = this.expect('function').val.name;
    this.state.push('function arguments');
    this.parens++;
    var args = this.args();
    this.expect(')');
    this.parens--;
    this.state.pop();
    return new nodes.Call(name, args);
  },

  /**
   * ident '(' params ')' block
   */

  functionDefinition: function() {
    var name = this.expect('function').val.name;

    // params
    this.state.push('function params');
    this.skipWhitespace();
    var params = this.params();
    this.skipWhitespace();
    this.expect(')');
    this.state.pop();

    // Body
    this.state.push('function');
    var fn = new nodes.Function(name, params);
    fn.block = this.block(fn);
    this.state.pop();
    return new nodes.Ident(name, fn);
  },

  /**
   *   ident
   * | ident '...'
   * | ident '=' expression
   * | ident ',' ident
   */

  params: function() {
    var tok
      , node
      , params = new nodes.Params;
    while (tok = this.accept('ident')) {
      this.accept('space');
      params.push(node = tok.val);
      if (this.accept('...')) {
        node.rest = true;
      } else if (this.accept('=')) {
        node.val = this.expression();
      }
      this.skipWhitespace();
      this.accept(',');
      this.skipWhitespace();
    }
    return params;
  },

  /**
   * (ident ':')? expression (',' (ident ':')? expression)*
   */

  args: function() {
    var args = new nodes.Arguments
      , keyword;

    do {
      // keyword
      if ('ident' == this.peek().type && ':' == this.lookahead(2).type) {
        keyword = this.next().val.string;
        this.expect(':');
        args.map[keyword] = this.expression();
      // arg
      } else {
        args.push(this.expression());
      }
    } while (this.accept(','));

    return args;
  },

  /**
   * expression (',' expression)*
   */

  list: function() {
    var node = this.expression();
    while (this.accept(',')) {
      if (node.isList) {
        list.push(this.expression());
      } else {
        var list = new nodes.Expression(true);
        list.push(node);
        list.push(this.expression());
        node = list;
      }
    }
    return node;
  },

  /**
   * negation+
   */

  expression: function() {
    var node
      , expr = new nodes.Expression;
    this.state.push('expression');
    while (node = this.negation()) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    this.state.pop();
    return expr;
  },

  /**
   *   'not' ternary
   * | ternary
   */

  negation: function() {
    if (this.accept('not')) {
      return new nodes.UnaryOp('!', this.negation());
    }
    return this.ternary();
  },

  /**
   * logical ('?' expression ':' expression)?
   */

  ternary: function() {
    var node = this.logical();
    if (this.accept('?')) {
      var trueExpr = this.expression();
      this.expect(':');
      var falseExpr = this.expression();
      node = new nodes.Ternary(node, trueExpr, falseExpr);
    }
    return node;
  },

  /**
   * typecheck (('&&' | '||') typecheck)*
   */

  logical: function() {
    var op
      , node = this.typecheck();
    while (op = this.accept('&&') || this.accept('||')) {
      node = new nodes.BinOp(op.type, node, this.typecheck());
    }
    return node;
  },

  /**
   * equality ('is a' equality)*
   */

  typecheck: function() {
    var op
      , node = this.equality();
    while (op = this.accept('is a')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.equality());
      this.operand = false;
    }
    return node;
  },

  /**
   * in (('==' | '!=') in)*
   */

  equality: function() {
    var op
      , node = this.in();
    while (op = this.accept('==') || this.accept('!=')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.in());
      this.operand = false;
    }
    return node;
  },

  /**
   * relational ('in' relational)*
   */

  in: function() {
    var node = this.relational();
    while (this.accept('in')) {
      this.operand = true;
      if (!node) this.error('illegal unary "in", missing left-hand operand');
      node = new nodes.BinOp('in', node, this.relational());
      this.operand = false;
    }
    return node;
  },

  /**
   * range (('>=' | '<=' | '>' | '<') range)*
   */

  relational: function() {
    var op
      , node = this.range();
    while (op =
         this.accept('>=')
      || this.accept('<=')
      || this.accept('<')
      || this.accept('>')
      ) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.range());
      this.operand = false;
    }
    return node;
  },

  /**
   * additive (('..' | '...') additive)*
   */

  range: function() {
    var op
      , node = this.additive();
    if (op = this.accept('...') || this.accept('..')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.val, node, this.additive());
      this.operand = false;
    }
    return node;
  },

  /**
   * multiplicative (('+' | '-') multiplicative)*
   */

  additive: function() {
    var op
      , node = this.multiplicative();
    while (op = this.accept('+') || this.accept('-')) {
      this.operand = true;
      node = new nodes.BinOp(op.type, node, this.multiplicative());
      this.operand = false;
    }
    return node;
  },

  /**
   * defined (('**' | '*' | '/' | '%') defined)*
   */

  multiplicative: function() {
    var op
      , node = this.defined();
    while (op =
         this.accept('**')
      || this.accept('*')
      || this.accept('/')
      || this.accept('%')) {
      this.operand = true;
      if ('/' == op && this.inProperty && !this.parens) {
        this.stash.push(new Token('literal', new nodes.Literal('/')));
        this.operand = false;
        return node;
      } else {
        if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
        node = new nodes.BinOp(op.type, node, this.defined());
        this.operand = false;
      }
    }
    return node;
  },

  /**
   *    unary 'is defined'
   *  | unary
   */

  defined: function() {
    var node = this.unary();
    if (this.accept('is defined')) {
      if (!node) this.error('illegal unary "is defined", missing left-hand operand');
      node = new nodes.BinOp('is defined', node);
    }
    return node;
  },

  /**
   *   ('!' | '~' | '+' | '-') unary
   * | subscript
   */

  unary: function() {
    var op
      , node;
    if (op =
         this.accept('!')
      || this.accept('~')
      || this.accept('+')
      || this.accept('-')) {
      this.operand = true;
      node = new nodes.UnaryOp(op.type, this.unary());
      this.operand = false;
      return node;
    }
    return this.subscript();
  },

  /**
   *   primary ('[' expression ']' '='?)+
   * | primary
   */

  subscript: function() {
    var node = this.primary();
    while (this.accept('[')) {
      node = new nodes.BinOp('[]', node, this.expression());
      this.expect(']');
      // TODO: TernaryOp :)
      if (this.accept('=')) {
        node.op += '=';
        node.val = this.expression();
      }
    }
    return node;
  },

  /**
   *   unit
   * | null
   * | color
   * | string
   * | ident
   * | boolean
   * | literal
   * | '(' expression ')' '%'?
   */

  primary: function() {
    var op
      , node;

    // Parenthesis
    if (this.accept('(')) {
      ++this.parens;
      var expr = this.expression();
      this.expect(')');
      --this.parens;
      if (this.accept('%')) expr.push(new nodes.Ident('%'));
      return expr;
    }

    // Primitive
    switch (this.peek().type) {
      case 'null':
      case 'unit':
      case 'color':
      case 'string':
      case 'literal':
      case 'boolean':
        return this.next().val;
      case 'ident':
        return this.ident();
      case 'function':
        return this.functionCall();
    }
  }
};
