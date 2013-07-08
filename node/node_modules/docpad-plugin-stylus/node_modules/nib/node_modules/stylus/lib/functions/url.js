
/*!
 * Stylus - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , parse = require('url').parse
  , extname = require('path').extname
  , utils = require('../utils')
  , fs = require('fs');

/**
 * Mime table.
 */

var mimes = {
    '.gif': 'image/gif'
  , '.png': 'image/png'
  , '.jpg': 'image/jpeg'
  , '.jpeg': 'image/jpeg'
  , '.svg': 'image/svg+xml'
};

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `limit` bytesize limit defaulting to 30Kb
 *    - `paths` image resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var _paths = options.paths || [];
  var sizeLimit = null != options.limit ? options.limit : 30000;

  function fn(url){
    // Compile the url
    var compiler = new Compiler(url);
    compiler.isURL = true;
    url = url.nodes.map(function(node){
      return compiler.visit(node);
    }).join('');

    // Parse literal
    url = parse(url);
    var ext = extname(url.pathname)
      , mime = mimes[ext]
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths)
      , buf;

    // Not supported
    if (!mime) return literal;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    var found = utils.lookup(url.pathname, paths);

    // Failed to lookup
    if (!found) return literal;

    // Read data
    buf = fs.readFileSync(found);

    // To large
    if (false !== sizeLimit && buf.length > sizeLimit) return literal;

    // Encode
    return new nodes.Literal('url("data:' + mime + ';base64,' + buf.toString('base64') + '")');
  };

  fn.raw = true;
  return fn;
};
