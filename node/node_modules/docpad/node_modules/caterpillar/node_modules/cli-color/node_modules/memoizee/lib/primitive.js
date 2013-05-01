// Memoize working in primitive mode

'use strict';

var CustomError  = require('es5-ext/lib/Error/custom')
  , hasListeners = require('event-emitter/lib/has-listeners')

  , getId0 = function () { return ''; }
  , getId1 = function (args) { return args[0]; }

  , apply = Function.prototype.apply, call = Function.prototype.call;

module.exports = require('./_base')(function (conf, length) {
	var get, cache = conf.cache = {}, fn
	  , hitListeners, initListeners, purgeListeners;

	if (length === 1) {
		get = conf.get = getId1;
	} else if (length === false) {
		get = conf.get = function (args, length) {
			var id = '', i;
			if (length) {
				id += args[i = 0];
				while (--length) {
					id += '\u0001' + args[++i];
				}
			} else {
				id = '\u0002';
			}
			return id;
		};
	} else if (length) {
		get = conf.get = function (args) {
			var id = String(args[0]), i = 0, l = length;
			while (--l) { id += '\u0001' + args[++i]; }
			return id;
		};
	} else {
		get = conf.get = getId0;
	}

	conf.memoized = (length === 1) ? function (id) {
		var value;
		if (cache.hasOwnProperty(id)) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			if (arguments.length === 1) {
				value = call.call(fn, this, id);
			} else {
				value = apply.call(fn, this, arguments);
			}
			if (cache.hasOwnProperty(id)) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	} : function () {
		var id = get(arguments), value;
		if (cache.hasOwnProperty(id)) {
			hitListeners && conf.emit('hit', id, arguments, this);
			return cache[id];
		} else {
			value = apply.call(conf.fn, this, arguments);
			if (cache.hasOwnProperty(id)) {
				throw new CustomError("Circular invocation", 'CIRCULAR_INVOCATION');
			}
			cache[id] = value;
			initListeners && conf.emit('init', id);
			return value;
		}
	};

	conf.clear = function (id) {
		if (cache.hasOwnProperty(id)) {
			purgeListeners && conf.emit('purge', id);
			delete cache[id];
		}
	};
	conf.clearAll = function () { cache = conf.cache = {}; };

	conf.once('ready', function () {
		fn = conf.fn;
		hitListeners = hasListeners(conf, 'hit');
		initListeners = hasListeners(conf, 'init');
		purgeListeners = hasListeners(conf, 'purge');
	});
});
