
/*!
 * Jade - utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Convert interpolation in the given string to JavaScript.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var interpolate = exports.interpolate = function(str){
  return str.replace(/(_SLASH_)?([#!]){(.*?)}/g, function(str, escape, flag, code){
    code = code
      .replace(/\\'/g, "'")
      .replace(/_SLASH_/g, '\\');

    return escape
      ? str.slice(7)
      : "' + "
        + ('!' == flag ? '' : 'escape')
        + "((interp = " + code
        + ") == null ? '' : interp) + '";
  });
};

/**
 * Escape single quotes in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

var escape = exports.escape = function(str) {
  return str.replace(/'/g, "\\'");
};

/**
 * Interpolate, and escape the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.text = function(str){
  return interpolate(escape(str));
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

exports.merge = function(a, b) {
  for (var key in b) a[key] = b[key];
  return a;
};

