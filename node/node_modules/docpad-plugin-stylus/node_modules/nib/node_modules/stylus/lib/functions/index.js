
/*!
 * Stylus - Evaluator - built-in functions
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , Image = require('./image')
  , units = require('../units')
  , path = require('path')
  , fs = require('fs');

/**
 * Color component name map.
 */

var componentMap = {
    red: 'r'
  , green: 'g'
  , blue: 'b'
  , alpha: 'a'
  , hue: 'h'
  , saturation: 's'
  , lightness: 'l'
};

/**
 * Color component unit type map.
 */

var unitMap = {
    hue: 'deg'
  , saturation: '%'
  , lightness: '%'
};

/**
 * Color type map.
 */

var typeMap = {
    red: 'rgba'
  , blue: 'rgba'
  , green: 'rgba'
  , alpha: 'rgba'
  , hue: 'hsla'
  , saturation: 'hsla'
  , lightness: 'hsla'
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l,a component values.
 *
 * Examples:
 *
 *    hsla(10deg, 50%, 30%, 0.5)
 *    // => HSLA
 *
 *    hsla(#ffcc00)
 *    // => HSLA
 *
 * @param {RGBA|HSLA|Unit} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @param {Unit} alpha
 * @return {HSLA}
 * @api public
 */

exports.hsla = function hsla(hue, saturation, lightness, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(hue);
      return hue.hsla;
    default:
      utils.assertType(hue, 'unit', 'hue');
      utils.assertType(saturation, 'unit', 'saturation');
      utils.assertType(lightness, 'unit', 'lightness');
      utils.assertType(alpha, 'unit', 'alpha');
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.HSLA(
          hue.val
        , saturation.val
        , lightness.val
        , alpha.val);
  }
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l component values.
 *
 * Examples:
 *
 *    hsl(10, 50, 30)
 *    // => HSLA
 *
 *    hsl(#ffcc00)
 *    // => HSLA
 *
 * @param {Unit|HSLA|RGBA} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @return {HSLA}
 * @api public
 */

exports.hsl = function hsl(hue, saturation, lightness){
  if (1 == arguments.length) {
    utils.assertColor(hue, 'color');
    return hue.hsla;
  } else {
    return exports.hsla(
        hue
      , saturation
      , lightness
      , new nodes.Unit(1));
  }
};

/**
 * Return type of `node`.
 *
 * Examples:
 * 
 *    type(12)
 *    // => 'unit'
 *
 *    type(#fff)
 *    // => 'color'
 *
 *    type(type)
 *    // => 'function'
 *
 *    type(unbound)
 *    typeof(unbound)
 *    type-of(unbound)
 *    // => 'ident'
 *
 * @param {Node} node
 * @return {String}
 * @api public
 */

exports.type =
exports.typeof =
exports['type-of'] = function type(node){
  utils.assertPresent(node, 'expression');
  return node.nodeName;
};

/**
 * Return component `name` for the given `color`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} na,e
 * @return {Unit}
 * @api public
 */

exports.component = function component(color, name) {
  utils.assertColor(color, 'color');
  utils.assertString(name, 'name');
  var name = name.string
    , unit = unitMap[name]
    , type = typeMap[name]
    , name = componentMap[name];
  if (!name) throw new Error('invalid color component "' + name + '"');
  return new nodes.Unit(color[type][name], unit);
};

/**
 * Return the basename of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.basename = function basename(p, ext){
  utils.assertString(p, 'path');
  return path.basename(p.val, ext && ext.val);
};

/**
 * Return the dirname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.dirname = function dirname(p){
  utils.assertString(p, 'path');
  return path.dirname(p.val);
};

/**
 * Return the extname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.extname = function extname(p){
  utils.assertString(p, 'path');
  return path.extname(p.val);
};

/**
 * Peform a path join.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

(exports.pathjoin = function pathjoin(){
  var paths = [].slice.call(arguments).map(function(path){
    return path.first.string;
  });
  return path.join.apply(null, paths);
}).raw = true;

/**
 * Return the red component of the given `color`.
 *
 * Examples:
 *
 *    red(#c00)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.red = function red(color){
  return exports.component(color, new nodes.String('red'));
};

/**
 * Return the green component of the given `color`.
 *
 * Examples:
 *
 *    green(#0c0)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.green = function green(color){
  return exports.component(color, new nodes.String('green'));
};

/**
 * Return the blue component of the given `color`.
 *
 * Examples:
 *
 *    blue(#00c)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.blue = function blue(color){
  return exports.component(color, new nodes.String('blue'));
};

/**
 * Return a `RGBA` from the r,g,b,a channels.
 *
 * Examples:
 *
 *    rgba(255,0,0,0.5)
 *    // => rgba(255,0,0,0.5)
 *
 *    rgba(255,0,0,1)
 *    // => #ff0000
 *
 *    rgba(#ffcc00, 50%)
 *    // rgba(255,204,0,0.5)
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @param {Unit} alpha
 * @return {RGBA}
 * @api public
 */

exports.rgba = function rgba(red, green, blue, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      var color = red.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , color.a);
    case 2:
      utils.assertColor(red);
      var color = red.rgba;
      utils.assertType(green, 'unit', 'alpha');
      if ('%' == green.type) green.val /= 100;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , green.val);
    default:
      utils.assertType(red, 'unit', 'red');
      utils.assertType(green, 'unit', 'green');
      utils.assertType(blue, 'unit', 'blue');
      utils.assertType(alpha, 'unit', 'alpha');
      var r = '%' == red.type ? Math.round(red.val * 2.55) : red.val;
      var g = '%' == green.type ? Math.round(green.val * 2.55) : green.val;
      var b = '%' == blue.type ? Math.round(blue.val * 2.55) : blue.val;
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.RGBA(
          r
        , g
        , b
        , alpha.val);
  }
};

/**
 * Return a `RGBA` from the r,g,b channels.
 *
 * Examples:
 *
 *    rgb(255,204,0)
 *    // => #ffcc00
 *
 *    rgb(#fff)
 *    // => #fff
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @return {RGBA}
 * @api public
 */

exports.rgb = function rgb(red, green, blue){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      var color = red.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , 1);
    default:
      return exports.rgba(
          red
        , green
        , blue
        , new nodes.Unit(1));
  }
};

/**
 * Convert a .json file into stylus variables
 * Nested variable object keys are joined with a dash (-)
 *
 * Given this sample media-queries.json file:
 * {
 *   "small": "screen and (max-width:400px)",
 *   "tablet": {
 *     "landscape": "screen and (min-width:600px) and (orientation:landscape)",
 *     "portrait": "screen and (min-width:600px) and (orientation:portrait)"
 *   }
 * }
 *
 * Examples:
 *
 *    json('media-queries.json')
 *    
 *    @media small
 *    // => @media screen and (max-width:400px)
 *
 *    @media tablet-landscape
 *    // => @media screen and (min-width:600px) and (orientation:landscape)
 *       
 * @param {String} path
 * @api public
*/

exports.json = function(path){
  utils.assertString(path, 'path');

  // lookup
  path = path.string;
  var found = utils.lookup(path, this.options.paths, this.options.filename);
  if (!found) throw new Error('failed to locate .json file ' + path);

  // read
  var str = fs.readFileSync(found, 'utf8');
  convert.call(this, JSON.parse(str));
  return;

  function convert(obj, prefix){
    prefix = prefix ? prefix + '-' : '';
    for (var key in obj){
      var val = obj[key];
      var name = prefix + key;
      if ('object' == typeof val) {
        convert.call(this, val, name);
      } else {
        val = utils.coerce(val);
        if ('string' == val.nodeName) val = parseUnit(val.string) || new nodes.Literal(val.string);
        this.global.scope.add({ name: name, val: val });
      }
    }
  }
};

/**
 * Unquote the given `str`.
 *
 * Examples:
 *
 *    unquote("sans-serif")
 *    // => sans-serif
 *
 *    unquote(sans-serif)
 *    // => sans-serif
 *
 * @param {String|Ident} string
 * @return {Literal}
 * @api public
 */

exports.unquote = function unquote(string){
  utils.assertString(string, 'string');
  return new nodes.Literal(string.string);
};

/**
 * Assign `type` to the given `unit` or return `unit`'s type.
 *
 * @param {Unit} unit
 * @param {String|Ident} type
 * @return {Unit}
 * @api public
 */

exports.unit = function unit(unit, type){
  utils.assertType(unit, 'unit', 'unit');

  // Assign
  if (type) {
    utils.assertString(type, 'type');
    return new nodes.Unit(unit.val, type.string);
  } else {
    return unit.type || '';
  }
};

/**
 * Lookup variable `name` or return Null.
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

exports.lookup = function lookup(name){
  utils.assertType(name, 'string', 'name');
  var node = this.lookup(name.val);
  if (!node) return nodes.null;
  return this.visit(node);
};

/**
 * Perform `op` on the `left` and `right` operands.
 *
 * @param {String} op
 * @param {Node} left
 * @param {Node} right
 * @return {Node}
 * @api public
 */

exports.operate = function operate(op, left, right){
  utils.assertType(op, 'string', 'op');
  utils.assertPresent(left, 'left');
  utils.assertPresent(right, 'right');
  return left.operate(op.val, right);
};

/**
 * Test if `val` matches the given `pattern`.
 *
 * Examples:
 *
 *     match('^foo(bar)?', foo)
 *     match('^foo(bar)?', foobar)
 *     match('^foo(bar)?', 'foo')
 *     match('^foo(bar)?', 'foobar')
 *     // => true
 *
 *     match('^foo(bar)?', 'bar')
 *     // => false
 *
 * @param {String} pattern
 * @param {String|Ident} val
 * @return {Boolean}
 * @api public
 */

exports.match = function match(pattern, val){
  utils.assertType(pattern, 'string', 'pattern');
  utils.assertString(val, 'val');
  var re = new RegExp(pattern.val);
  return nodes.Boolean(re.test(val.string));
};

/**
 * Return length of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api public
 */

(exports.length = function length(expr){
  if (expr) {
    return expr.nodes
      ? utils.unwrap(expr).nodes.length
      : 1;
  }
  return 0;
}).raw = true;

/**
 * Inspect the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

(exports.p = function p(){
  [].slice.call(arguments).forEach(function(expr){
    expr = utils.unwrap(expr);
    if (!expr.nodes.length) return;
    console.log('\033[90minspect:\033[0m %s', expr.toString().replace(/^\(|\)$/g, ''));
  })
  return nodes.null;
}).raw = true;

/**
 * Throw an error with the given `msg`.
 *
 * @param {String} msg
 * @api public
 */

exports.error = function error(msg){
  utils.assertType(msg, 'string', 'msg');
  throw new Error(msg.val);
};

/**
 * Warn with the given `msg` prefixed by "Warning: ".
 *
 * @param {String} msg
 * @api public
 */

exports.warn = function warn(msg){
  utils.assertType(msg, 'string', 'msg');
  console.warn('Warning: %s', msg.val);
  return nodes.null;
};

/**
 * Output stack trace.
 *
 * @api public
 */

exports.trace = function trace(){
  console.log(this.stack);
  return nodes.null;
};

/**
 * Push the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.push = exports.append = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.push(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Pop a value from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.pop = function pop(expr) {
  expr = utils.unwrap(expr);
  return expr.nodes.pop();
}).raw = true;

/**
 * Unshift the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.unshift = exports.prepend = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.unshift(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Shift an element from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

 (exports.shift = function(expr){
   expr = utils.unwrap(expr);
   return expr.nodes.shift();
 }).raw = true;

/**
 * Return a `Literal` with the given `fmt`, and
 * variable number of arguments.
 *
 * @param {String} fmt
 * @param {Node} ...
 * @return {Literal}
 * @api public
 */

(exports.s = function s(fmt){
  fmt = utils.unwrap(fmt).nodes[0];
  utils.assertString(fmt);
  var self = this
    , str = fmt.string
    , args = arguments
    , i = 1;

  // format
  str = str.replace(/%(s|d)/g, function(_, specifier){
    var arg = args[i++] || nodes.null;
    switch (specifier) {
      case 's':
        return new Compiler(arg, self.options).compile();
      case 'd':
        arg = utils.unwrap(arg).first;
        if ('unit' != arg.nodeName) throw new Error('%d requires a unit');
        return arg.val;
    }
  });

  return new nodes.Literal(str);
}).raw = true;

/**
 * Return the opposites of the given `positions`.
 *
 * Examples:
 *
 *    opposite-position(top left)
 *    // => bottom right
 *
 * @param {Expression} positions
 * @return {Expression}
 * @api public
 */

(exports['opposite-position'] = function oppositePosition(positions){
  var expr = [];
  utils.unwrap(positions).nodes.forEach(function(pos, i){
    utils.assertString(pos, 'position ' + i);
    pos = (function(){ switch (pos.string) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
      case 'center': return 'center';
      default: throw new Error('invalid position ' + pos);
    }})();
    expr.push(new nodes.Literal(pos));
  });
  return expr;
}).raw = true;

/**
 * Return the width and height of the given `img` path.
 *
 * Examples:
 *
 *    image-size('foo.png')
 *    // => 200px 100px
 *
 *    image-size('foo.png')[0]
 *    // => 200px
 *
 *    image-size('foo.png')[1]
 *    // => 100px
 *
 * @param {String} img
 * @return {Expression}
 * @api public
 */

exports['image-size'] = function imageSize(img) {
  utils.assertType(img, 'string', 'img');
  var img = new Image(this, img.string);

  // Read size
  img.open();
  var size = img.size();
  img.close();

  // Return (w h)
  var expr = [];
  expr.push(new nodes.Unit(size[0], 'px'));
  expr.push(new nodes.Unit(size[1], 'px'));

  return expr;
};

/**
 * Apply Math `fn` to `n`.
 *
 * @param {Unit} n
 * @param {String} fn
 * @return {Unit}
 * @api private
 */

exports['-math'] = function math(n, fn){
  return new nodes.Unit(Math[fn.string](n.val), n.type);
};

/**
 * Get Math `prop`.
 *
 * @param {String} prop
 * @return {Unit}
 * @api private
 */

exports['-math-prop'] = function math(prop){
  return new nodes.Unit(Math[prop.string]);
};

/**
 * Buffer the given js `str`.
 *
 * @param {String} str
 * @return {JSLiteral}
 * @api private
 */

exports.js = function js(str){
  utils.assertString(str, 'str');
  return new nodes.JSLiteral(str.val);
};

/**
 * Adjust HSL `color` `prop` by `amount`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} prop
 * @param {Unit} amount
 * @return {RGBA}
 * @api private
 */

exports['-adjust'] = function adjust(color, prop, amount){
  var hsl = color.hsla.clone();
  prop = { hue: 'h', saturation: 's', lightness: 'l' }[prop.string];
  if (!prop) throw new Error('invalid adjustment property');
  var val = amount.val;
  if ('%' == amount.type){
    val = 'l' == prop && val > 0
      ? (100 - hsl[prop]) * val / 100
      : hsl[prop] * (val / 100);
  }
  hsl[prop] += val;
  return hsl.rgba;
};

/**
 * Return a clone of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.clone = function clone(expr){
  utils.assertPresent(expr, 'expr');
  return expr.clone();
}).raw = true;

/**
 * Add property `name` with the given `expr`
 * to the mixin-able block.
 *
 * @param {String|Ident|Literal} name
 * @param {Expression} expr
 * @return {Property}
 * @api public
 */

(exports['add-property'] = function addProperty(name, expr){
  utils.assertType(name, 'expression', 'name');
  name = utils.unwrap(name).first;
  utils.assertString(name, 'name');
  utils.assertType(expr, 'expression', 'expr');
  var prop = new nodes.Property([name], expr);
  var block = this.closestBlock;

  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index++, len);
  head.push(prop);
  block.nodes = head.concat(tail);
  
  return prop;
}).raw = true;

/**
 * Attempt to parse unit `str`.
 *
 * @param {String} str
 * @return {Unit}
 * @api public
 */

function parseUnit(str){
  var m = str.match(/^(\d+)(.*)/);
  if (!m) return;
  var n = parseInt(m[1], 10);
  var type = m[2];
  return new nodes.Unit(n, type);
}