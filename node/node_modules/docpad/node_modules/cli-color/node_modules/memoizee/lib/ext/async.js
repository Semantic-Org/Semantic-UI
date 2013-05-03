// Support for asynchronous functions

'use strict';

var toArray    = require('es5-ext/lib/Array/from')
  , last       = require('es5-ext/lib/Array/prototype/last')
  , forEach    = require('es5-ext/lib/Object/for-each')
  , isCallable = require('es5-ext/lib/Object/is-callable')
  , nextTick   = require('next-tick')

  , isArray = Array.isArray, slice = Array.prototype.slice
  , apply = Function.prototype.apply;

require('../_base').ext.async = function (ignore, conf) {
	var cache, purge;

	cache = conf.async = {};

	(function (org) {
		var value, cb, initContext, initArgs, fn, resolver;

		conf.on('init', function (id) {
			value.id = id;
			cache[id] = cb ? [cb] : [];
		});

		conf.on('hit', function (id, syncArgs, syncCtx) {
			if (!cb) {
				return;
			}

			if (isArray(cache[id])) {
				cache[id].push(cb);
			} else {
				nextTick(function (cb, id, ctx, args) {
					if (cache[id]) {
						conf.emit('hitasync', id, syncArgs, syncCtx);
						apply.call(cb, this.context, this);
					} else {
						// Purged in a meantime, we shouldn't rely on cached value, recall
						fn.apply(ctx, args);
					}
				}.bind(cache[id], cb, id, initContext, initArgs));
				initContext = initArgs = null;
			}
		});
		conf.fn = function () {
			var args, asyncArgs;
			args = arguments;
			asyncArgs = toArray(args);
			asyncArgs.push(value = function self(err) {
				var i, cb, waiting, res;
				if (self.id == null) {
					// Shouldn't happen, means async callback was called sync way
					nextTick(apply.bind(self, this, arguments));
					return;
				}
				waiting = cache[self.id];
				if (conf.cache.hasOwnProperty(self.id)) {
					if (err) {
						delete cache[self.id];
						conf.clear(self.id);
					} else {
						arguments.context = this;
						cache[self.id] = arguments;
						conf.emit('initasync', self.id, waiting.length);
					}
				} else {
					delete cache[self.id];
				}
				for (i = 0; (cb = waiting[i]); ++i) {
					res = apply.call(cb, this, arguments);
				}
				return res;
			});
			return apply.call(org, this, asyncArgs);
		};

		fn = conf.memoized;
		resolver = function (args) {
			cb = last.call(args);
			if (isCallable(cb)) {
				return slice.call(args, 0, -1);
			} else {
				cb = null;
				return args;
			}
		};
		conf.memoized = function () {
			return fn.apply(initContext = this, initArgs = resolver(arguments));
		};
		forEach(fn, function (value, name) {
			conf.memoized[name] = function () {
				return fn[name].apply(this, resolver(arguments));
			};
		});

	}(conf.fn));

	conf.on('purge', purge = function (id) {
		// If false, we don't have value yet, so we assume that intention is not
		// to memoize this call. After value is obtained we don't cache it but
		// gracefully pass to callback
		if (!isArray(cache[id])) {
			conf.emit('purgeasync', id);
			delete cache[id];
		}
	});

	conf.on('purgeall', function () {
		forEach(conf.async, function (value, id) { purge(id); });
	});
};
