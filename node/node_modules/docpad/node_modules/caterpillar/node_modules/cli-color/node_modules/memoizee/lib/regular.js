// Memoize working in object mode (supports any type of arguments)

'use strict';

var CustomError  = require('es5-ext/lib/Error/custom')
  , indexOf      = require('es5-ext/lib/Array/prototype/e-index-of')
  , hasListeners = require('event-emitter/lib/has-listeners')

  , apply = Function.prototype.apply;

// Results are saved internally within array matrix:
// [0] -> Result of calling function with no arguments
// [1] -> Matrix that keeps results when function is called with one argument
//        [1][0] -> Array of arguments with which
//                 function have been called
//        [1][1] -> Array of results that matches [1][0] array
// [2] -> Matrix that keeps results when function is called with two arguments
//        [2][0] -> Array of first (of two) arguments with which
//                function have been called
//        [2][1] -> Matrixes that keeps results for two arguments function calls
//                  Each matrix matches first argument found in [2][0]
//                  [2][1][x][0] -> Array of second arguments with which
//                                  function have been called.
//                  [2][1][x][1] -> Array of results that matches [2][1][x][0]
//                                   arguments array
// ...and so on
module.exports = require('./_base')(function (conf, length) {
	var map, map1, map2, get, set, clear, count, fn
	  , hitListeners, initListeners, purgeListeners
	  , cache = conf.cache = {}, argsCache;

	if (length === 0) {
		map = null;
		get = conf.get = function () { return map; };
		set = function () { return ((map = 1)); };
		clear = function () { map = null; };
		conf.clearAll = function () {
			map = null;
			cache = conf.cache = {};
		};
	} else {
		count = 0;
		if (length === 1) {
			map1 = [];
			map2 = [];
			get = conf.get = function (args) {
				var index = indexOf.call(map1, args[0]);
				return (index === -1) ? null : map2[index];
			};
			set = function (args) {
				map1.push(args[0]);
				map2.push(++count);
				return count;
			};
			clear = function (id) {
				var index = indexOf.call(map2, id);
				if (index !== -1) {
					map1.splice(index, 1);
					map2.splice(index, 1);
				}
			};
			conf.clearAll = function () {
				map1 = [];
				map2 = [];
				cache = conf.cache = {};
			};
		} else if (length === false) {
			map = [];
			argsCache = {};
			get = conf.get = function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					return set[length] || null;
				} else if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) return null;
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					return set[1][i] || null;
				}
				return null;
			};
			set = function (args) {
				var index = 0, set = map, i, length = args.length;
				if (length === 0) {
					set[length] = ++count;
				} else {
					if (!set[length]) {
						set[length] = [[], []];
					}
					set = set[length];
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							i = set[0].push(args[index]) - 1;
							set[1].push([[], []]);
						}
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
					}
					set[1][i] = ++count;
				}
				argsCache[count] = args;
				return count;
			};
			clear = function (id) {
				var index = 0, set = map, i, args = argsCache[id], length = args.length
				  , path = [];
				if (length === 0) {
					delete set[length];
				} else if ((set = set[length])) {
					while (index < (length - 1)) {
						i = indexOf.call(set[0], args[index]);
						if (i === -1) {
							return;
						}
						path.push(set, i);
						set = set[1][i];
						++index;
					}
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					id = set[1][i];
					set[0].splice(i, 1);
					set[1].splice(i, 1);
					while (!set[0].length && path.length) {
						i = path.pop();
						set = path.pop();
						set[0].splice(i, 1);
						set[1].splice(i, 1);
					}
				}
				delete argsCache[id];
			};
			conf.clearAll = function () {
				map = [];
				cache = conf.cache = {};
				argsCache = {};
			};
		} else {
			map = [[], []];
			argsCache = {};
			get = conf.get = function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) return null;
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) return null;
				return set[1][i] || null;
			};
			set = function (args) {
				var index = 0, set = map, i;
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						i = set[0].push(args[index]) - 1;
						set[1].push([[], []]);
					}
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					i = set[0].push(args[index]) - 1;
				}
				set[1][i] = ++count;
				argsCache[count] = args;
				return count;
			};
			clear = function (id) {
				var index = 0, set = map, i, path = [], args = argsCache[id];
				while (index < (length - 1)) {
					i = indexOf.call(set[0], args[index]);
					if (i === -1) {
						return;
					}
					path.push(set, i);
					set = set[1][i];
					++index;
				}
				i = indexOf.call(set[0], args[index]);
				if (i === -1) {
					return;
				}
				id = set[1][i];
				set[0].splice(i, 1);
				set[1].splice(i, 1);
				while (!set[0].length && path.length) {
					i = path.pop();
					set = path.pop();
					set[0].splice(i, 1);
					set[1].splice(i, 1);
				}
				delete argsCache[id];
			};
			conf.clearAll = function () {
				map = [[], []];
				cache = conf.cache = {};
				argsCache = {};
			};
		}
	}
	conf.memoized = function () {
		var id = get(arguments), value;
		if (id != null) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			value = apply.call(fn, this, arguments);
			id = get(arguments);
			if (id != null) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			id = set(arguments);
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	};
	conf.clear = function (id) {
		if (cache.hasOwnProperty(id)) {
			purgeListeners && conf.emit('purge', id);
			clear(id);
			delete cache[id];
		}
	};

	conf.once('ready', function () {
		fn = conf.fn;
		hitListeners = hasListeners(conf, 'hit');
		initListeners = hasListeners(conf, 'init');
		purgeListeners = hasListeners(conf, 'purge');
	});
});
