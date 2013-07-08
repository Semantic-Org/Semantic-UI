/*!
 * Stylus - css to stylus conversion
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Convert the given `css` to stylus source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

module.exports = function(css){
  return new Converter(css).stylus();
};

/**
 * Initialize a new `Converter` with the given `css`.
 *
 * @param {String} css
 * @api private
 */

function Converter(css) {
  var cssom = require('cssom');
  this.css = css;
  this.types = cssom.CSSRule;
  this.root = cssom.parse(css);
  this.indents = 0;
}

/**
 * Convert to stylus.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.stylus = function(){
  return this.visitRules(this.root.cssRules);
};

/**
 * Return indent string.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.__defineGetter__('indent', function(){
  return Array(this.indents + 1).join('  ');
});

/**
 * Visit `node`.
 *
 * @param {CSSRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visit = function(node){
  switch (node.type) {
    case this.types.STYLE_RULE:
      return this.visitStyle(node);
    case this.types.MEDIA_RULE:
      return this.visitMedia(node);
  }
};

/**
 * Visit the rules on `node`.
 *
 * @param {CSSRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRules = function(node){
  var buf = '';
  for (var i = 0, len = node.length; i < len; ++i) {
    buf += this.visit(node[i]);
  }
  return buf;
};

/**
 * Visit CSSMediaRule `node`.
 *
 * @param {CSSMediaRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitMedia = function(node){
  var buf = this.indent + '@media ';
  for (var i = 0, len = node.media.length; i < len; ++i) {
    buf += node.media[i];
  }
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.cssRules);
  --this.indents;
  return buf;
};

/**
 * Visit CSSStyleRule `node`.`
 *
 * @param {CSSStyleRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitStyle = function(node){
  var buf = this.indent + node.selectorText + '\n';
  ++this.indents;
  for (var i = 0, len = node.style.length; i < len; ++i) {
    var prop = node.style[i]
      , val = node.style[prop]
      , importance = node.style['_importants'][prop] ? ' !important' : '';
    if (prop) {
      buf += this.indent + prop + ': ' + val + importance + '\n';
    }
  }
  --this.indents;
  return buf + '\n';
};