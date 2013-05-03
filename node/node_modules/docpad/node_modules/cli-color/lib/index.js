'use strict';

var d       = require('es5-ext/lib/Object/descriptor')
  , extend  = require('es5-ext/lib/Object/extend')
  , map     = require('es5-ext/lib/Object/map')
  , reduce  = require('es5-ext/lib/Object/reduce')
  , repeat  = require('es5-ext/lib/String/prototype/repeat')
  , memoize = require('memoizee')
  , tty     = require('tty')

  , join = Array.prototype.join, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties, abs = Math.abs
  , floor = Math.floor, max = Math.max, min = Math.min

  , mods, proto, getFn, getMove, xtermMatch
  , up, down, right, left, getHeight, memoized;

mods = extend({
	// Style
	bold:      { _bold: [1, 22] },
	italic:    { _italic: [3, 23] },
	underline: { _underline: [4, 24] },
	inverse:   { _inverse: [7, 27] },
	strike:    { _strike: [9, 29] }
},

	// Color
	['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white']
		.reduce(function (obj, color, index) {
		// foreground
		obj[color] = { _fg: [30 + index, 39] };
		obj[color + 'Bright'] = { _fg: [90 + index, 39] };

		// background
		obj['bg' + color[0].toUpperCase() + color.slice(1)] =
			{ _bg: [40 + index, 49] };
		obj['bg' + color[0].toUpperCase() + color.slice(1) + 'Bright'] =
			{ _bg: [100 + index, 49] };

		return obj;
	}, {}));

// Some use cli-color as: console.log(clc.red('Error!'));
// Which is inefficient as on each call it configures new clc object
// with memoization we reuse once created object
memoized = memoize(function (scope, mod) {
	return defineProperty(getFn(), '_cliColorData',
		d(extend({}, scope._cliColorData, mod)));
});

proto = Object.create(Function.prototype, extend(map(mods, function (mod) {
	return d.gs(function () { return memoized(this, mod); });
}), {
	// xterm (255) color
	xterm: d(memoize(function (code) {
		code = isNaN(code) ? 255 : min(max(code, 0), 255);
		return defineProperty(getFn(), '_cliColorData',
			d(extend({}, this._cliColorData, {
				_fg: [xtermMatch ? xtermMatch[code] : ('38;5;' + code), 39]
			})));
	}, { method: 'xterm' })),
	bgXterm: d(memoize(function (code) {
		code = isNaN(code) ? 255 : min(max(code, 0), 255);
		return defineProperty(getFn(), '_cliColorData',
			d(extend({}, this._cliColorData, {
				_bg: [xtermMatch ? (xtermMatch[code] + 10) : ('48;5;' + code), 49]
			})));
	}, { method: 'bgXterm' }))
}));

if (process.platform === 'win32') {
	xtermMatch = require('./_xterm-match');
}

getFn = function () {
	var fn = function (/*…msg*/) {
		var data = fn._cliColorData, close = '';
		return reduce(data, function (str, mod) {
			close = '\x1b[' + mod[1] + 'm' + close;
			return str + '\x1b[' + mod[0] + 'm';
		}, '', true) + join.call(arguments, ' ') + close;
	};
	fn.__proto__ = proto;
	return fn;
};

getMove = function (control) {
	return function (num) {
		num = isNaN(num) ? 0 : max(floor(num), 0);
		return num ? ('\x1b[' + num + control) : '';
	};
};

module.exports = defineProperties(getFn(), {
	width: d.gs(process.stdout.getWindowSize ? function () {
		return process.stdout.getWindowSize()[0];
	} : function () {
		return tty.getWindowSize ? tty.getWindowSize()[1] : 0;
	}),
	height: d.gs(getHeight = process.stdout.getWindowSize ? function () {
		return process.stdout.getWindowSize()[1];
	} : function () {
		return tty.getWindowSize ? tty.getWindowSize()[0] : 0;
	}),
	reset: d.gs(function () {
		return repeat.call('\n', getHeight() - 1) + '\x1bc';
	}),
	up: d(up = getMove('A')),
	down: d(down = getMove('B')),
	right: d(right = getMove('C')),
	left: d(left = getMove('D')),
	move: d(function (x, y) {
		x = isNaN(x) ? 0 : floor(x);
		y = isNaN(y) ? 0 : floor(y);
		return ((x > 0) ? right(x) : left(-x)) + ((y > 0) ? down(y) : up(-y));
	}),
	moveTo: d(function (x, y) {
		x = isNaN(x) ? 1 : (max(floor(x), 0) + 1);
		y = isNaN(y) ? 1 : (max(floor(y), 0) + 1);
		return '\x1b[' + y + ';' + x + 'H';
	}),
	bol: d(function (n/*, erase*/) {
		var dir;
		n = isNaN(n) ? 0 : Number(n);
		dir = (n >= 0) ? 'E' : 'F';
		n = floor(abs(n));
		return arguments[1] ?
				(((!n || (dir === 'F')) ? '\x1b[0E\x1bK' : '') +
					repeat.call('\x1b[1' + dir + '\x1b[K', n)) : '\x1b[' + n + dir;
	}),
	beep: d('\x07'),
	xtermSupported: d(Boolean(!xtermMatch)),
	_cliColorData: d({})
});
