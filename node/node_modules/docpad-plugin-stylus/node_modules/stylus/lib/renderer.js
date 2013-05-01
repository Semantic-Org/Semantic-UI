
/*!
 * Stylus - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , EventEmitter = require('events').EventEmitter
  , Compiler = require('./visitor/compiler')
  , Evaluator = require('./visitor/evaluator')
  , Normalizer = require('./visitor/normalizer')
  , utils = require('./utils')
  , nodes = require('./nodes')
  , path = require('path')
  , join = path.join;

/**
 * Expose `Renderer`.
 */

module.exports = Renderer;

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

function Renderer(str, options) {
  options = options || {};
  options.globals = {};
  options.functions = {};
  options.imports = [join(__dirname, 'functions')];
  options.paths = options.paths || [];
  options.filename = options.filename || 'stylus';
  this.options = options;
  this.str = str;
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Renderer.prototype.__proto__ = EventEmitter.prototype;

/**
 * Parse and evaluate AST, then callback `fn(err, css, js)`.
 *
 * @param {Function} fn
 * @api public
 */

Renderer.prototype.render = function(fn){
  var parser = this.parser = new Parser(this.str, this.options);
  try {
    nodes.filename = this.options.filename;
    // parse
    var ast = parser.parse();

    // evaluate
    this.evaluator = new Evaluator(ast, this.options);
    ast = this.evaluator.evaluate();

    // normalize
    var normalizer = new Normalizer(ast, this.options);
    ast = normalizer.normalize();

    // compile
    var compiler = new Compiler(ast, this.options)
      , css = compiler.compile();

    this.emit('end', css);
    if (!fn) return css;
    fn(null, css);
  } catch (err) {
    var options = {};
    options.input = err.input || this.str;
    options.filename = err.filename || this.options.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    if (!fn) throw utils.formatException(err, options);
    fn(utils.formatException(err, options));
  }
};

/**
 * Set option `key` to `val`.
 *
 * @param {String} key
 * @param {Mixed} val
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Get option `key`.
 *
 * @param {String} key
 * @return {Mixed} val
 * @api public
 */

Renderer.prototype.get = function(key){
  return this.options[key];
};

/**
 * Include the given `path` to the lookup paths array.
 *
 * @param {String} path
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.include = function(path){
  this.options.paths.push(path);
  return this;
};

/**
 * Use the given `fn`.
 *
 * This allows for plugins to alter the renderer in
 * any way they wish, exposing paths etc.
 *
 * @param {Function}
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.use = function(fn){
  fn.call(this, this);
  return this;
};

/**
 * Define function or global var with the given `name`. Optionally
 * the function may accept full expressions, by setting `raw`
 * to `true`.
 *
 * @param {String} name
 * @param {Function|Node} fn
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.define = function(name, fn, raw){
  fn = utils.coerce(fn);

  if (fn.nodeName) {
    this.options.globals[name] = fn;
    return this;
  }

  // function
  this.options.functions[name] = fn;
  if (undefined != raw) fn.raw = raw;
  return this;
};

/**
 * Import the given `file`.
 *
 * @param {String} file
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.import = function(file){
  this.options.imports.push(file);
  return this;
};


