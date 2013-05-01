
/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , Canvas = require('canvas')
  , nodes = stylus.nodes
  , utils = stylus.utils

/**
 * Expose `ColorImage`.
 */

exports = module.exports = ColorImage;

/**
 * Create a new `ColorImage` node with the given `color`.
 *
 * @param {Color} color node
 * @return {ColorImage}
 * @api public
 */

exports.create = function(color){
  utils.assertColor(color);
  return new ColorImage(color);
};

/**
 * Return the data URI for `colorImage`.
 *
 * @param {ColorImage} colorImage
 * @return {String}
 * @api public
 */

exports.dataURL = function(colorImage){
  utils.assertType(colorImage, 'colorimage');
  return new nodes.String(colorImage.toDataURL());
};

/**
 * Initialize a new `ColorImage` node with the given arguments.
 *
 * @param {Color} color node
 * @api private
 */

function ColorImage(color) {
  this.color = color;
  this.canvas = new Canvas(1, 1);
  this.ctx = this.canvas.getContext('2d');
  this.ctx.fillStyle = color.toString();
  this.ctx.fillRect(0, 0, 1, 1);
};

/**
 * Inherit from `nodes.Node.prototype`.
 */

ColorImage.prototype.__proto__ = nodes.Node.prototype;

/**
 * Inspect the color.
 *
 * @return {String}
 * @api private
 */

ColorImage.prototype.toString = function(){
  return 'ColorImage(' + this.color.toString() + ')';
};

/**
 * Return data URI string.
 *
 * @return {String}
 * @api private
 */

ColorImage.prototype.toDataURL = function(){
  return this.canvas.toDataURL();
};
