
/*!
 * Stylus - utils
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , join = require('path').join
  , fs = require('fs');

/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

exports.absolute = function(path){
  return /^([a-z]:\\)|\//i.test(path);
};

/**
 * Attempt to lookup `path` within `paths` from tail to head.
 * Optionally a path to `ignore` may be passed.
 *
 * @param {String} path
 * @param {String} paths
 * @param {String} ignore
 * @return {String}
 * @api private
 */

exports.lookup = function(path, paths, ignore){
  var lookup
    , i = paths.length;

  // Absolute
  if (exports.absolute(path)) {
    try {
      fs.statSync(path);
      return path;
    } catch (err) {
      // Ignore, continue on
      // to trying relative lookup.
      // Needed for url(/images/foo.png)
      // for example
    }
  }

  // Relative
  while (i--) {
    try {
      lookup = join(paths[i], path);
      if (ignore == lookup) continue;
      fs.statSync(lookup);
      return lookup;
    } catch (err) {
      // Ignore
    }
  }
};

/**
 * Format the given `err` with the given `options`.
 *
 * Options:
 *
 *   - `filename`   context filename
 *   - `context`    context line count [8]
 *   - `lineno`     context line number
 *   - `input`        input string
 *
 * @param {Error} err
 * @param {Object} options
 * @return {Error}
 * @api private
 */

exports.formatException = function(err, options){
  var lineno = options.lineno
    , filename = options.filename
    , str = options.input
    , context = options.context || 8
    , context = context / 2
    , lines = ('\n' + str).split('\n')
    , start = Math.max(lineno - context, 1)
    , end = Math.min(lines.length, lineno + context)
    , pad = end.toString().length;

  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start;
    return (curr == lineno ? ' > ' : '   ')
      + Array(pad - curr.toString().length + 1).join(' ')
      + curr
      + '| '
      + line;
  }).join('\n');

  err.message = filename
    + ':' + lineno
    + '\n' + context
    + '\n\n' + err.message + '\n'
    + (err.stylusStack ? err.stylusStack + '\n' : '');

  return err;
};

/**
 * Assert that `node` is of the given `type`, or throw.
 *
 * @param {Node} node
 * @param {Function} type
 * @param {String} param
 * @api public
 */

exports.assertType = function(node, type, param){
  exports.assertPresent(node, param);
  if (node.nodeName == type) return;
  var actual = node.nodeName
    , msg = 'expected "'
      + param + '" to be a '
      + type + ', but got '
      + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that `node` is a `String` or `Ident`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertString = function(node, param){
  exports.assertPresent(node, param);
  switch (node.nodeName) {
    case 'string':
    case 'ident':
    case 'literal':
      return;
    default:
      var actual = node.nodeName
        , msg = 'expected string, ident or literal, but got ' + actual + ':' + node;
      throw new Error('TypeError: ' + msg);
  }
};

/**
 * Assert that `node` is a `RGBA` or `HSLA`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertColor = function(node, param){
  exports.assertPresent(node, param);
  switch (node.nodeName) {
    case 'rgba':
    case 'hsla':
      return;
    default:
      var actual = node.nodeName
        , msg = 'expected rgba or hsla, but got ' + actual + ':' + node;
      throw new Error('TypeError: ' + msg);
  }
};

/**
 * Assert that param `name` is given, aka the `node` is passed.
 *
 * @param {Node} node
 * @param {String} name
 * @api public
 */

exports.assertPresent = function(node, name){
  if (node) return;
  if (name) throw new Error('"' + name + '" argument required');
  throw new Error('argument missing');
};

/**
 * Unwrap `expr`.
 *
 * Takes an expressions with length of 1
 * such as `((1 2 3))` and unwraps it to `(1 2 3)`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

exports.unwrap = function(expr){
  // explicitly preserve the expression
  if (expr.preserve) return expr;
  if ('arguments' != expr.nodeName && 'expression' != expr.nodeName) return expr;
  if (1 != expr.nodes.length) return expr;
  if ('arguments' != expr.nodes[0].nodeName && 'expression' != expr.nodes[0].nodeName) return expr;
  return exports.unwrap(expr.nodes[0]);
};

/**
 * Coerce JavaScript values to their Stylus equivalents.
 *
 * @param {Mixed} val
 * @return {Node}
 * @api public
 */

exports.coerce = function(val){
  switch (typeof val) {
    case 'function':
      return val;
    case 'string':
      return new nodes.String(val);
    case 'boolean':
      return new nodes.Boolean(val);
    case 'number':
      return new nodes.Unit(val);
    default:
      if (null == val) return nodes.null;
      if (Array.isArray(val)) return exports.coerceArray(val);
      if (val.nodeName) return val;
      return exports.coerceObject(val);
  }
};

/**
 * Coerce a javascript `Array` to a Stylus `Expression`.
 *
 * @param {Array} val
 * @return {Expression}
 * @api private
 */

exports.coerceArray = function(val){
  var expr = new nodes.Expression;
  val.forEach(function(val){
    expr.push(exports.coerce(val));
  });
  return expr;
};

/**
 * Coerce a javascript object to a Stylus `Expression`.
 *
 * For example `{ foo: 'bar', bar: 'baz' }` would become
 * the expression `(foo 'bar') (bar 'baz')`.
 *
 * @param {Object} obj
 * @return {Expression}
 * @api public
 */

exports.coerceObject = function(obj){
  var expr = new nodes.Expression
    , val;

  for (var key in obj) {
    val = exports.coerce(obj[key]);
    key = new nodes.Ident(key);
    expr.push(exports.coerceArray([key, val]));
  }

  return expr;
};

/**
 * Return param names for `fn`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api private
 */

exports.params = function(fn){
  return fn
    .toString()
    .match(/\(([^)]*)\)/)[1].split(/ *, */);
};

/**
 * Merge object `b` with `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function(a, b){
  for (var k in b) a[k] = b[k];
  return a;
}
