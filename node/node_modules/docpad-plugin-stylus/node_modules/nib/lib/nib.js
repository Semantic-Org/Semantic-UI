
/*!
 * nib
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , nodes = stylus.nodes
  , utils = stylus.utils
  , Canvas

exports = module.exports = plugin;

// conditionally expose canvas-based APIs.

try {
  Canvas = require('canvas');

  var gradient = require('./nodes/gradient')
    , colorImage = require('./nodes/color-image')
} catch (err) {
  // ignore
}

/**
 * Library version.
 */

exports.version = '0.8.2';

/**
 * Stylus path.
 */

exports.path = __dirname;

/**
 * Return the plugin callback for stylus.
 *
 * @return {Function}
 * @api public
 */

function plugin() {
  return function(style){
    style.include(__dirname);

    if (Canvas) {
      style.define('has-canvas', nodes.true);

      // gradients
      style.define('create-gradient-image', gradient.create)
      style.define('gradient-data-uri', gradient.dataURL)
      style.define('add-color-stop', gradient.addColorStop)

      // color images
      style.define('create-color-image', colorImage.create)
      style.define('color-data-uri', colorImage.dataURL);
    } else {
      style.define('has-canvas', nodes.false);
    }
  }
}
