// Timeout cached values

'use strict';

var isNumber = require('es5-ext/lib/Number/is-number')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , nextTick = require('next-tick')
  , ext      = require('../_base').ext

  , max = Math.max, min = Math.min;

ext.maxAge = function (maxAge, conf, options) {
	var cache, async, preFetchAge, preFetchCache;

	maxAge = maxAge >>> 0;
	if (!maxAge) {
		return;
	}

	cache = {};
	async = options.async && ext.async;
	conf.on('init' + (async ? 'async' : ''), function (id) {
		cache[id] = setTimeout(function () { conf.clear(id); }, maxAge);
		if (preFetchCache) {
			preFetchCache[id] = setTimeout(function () { delete preFetchCache[id]; },
				preFetchAge);
		}
	});
	conf.on('purge' + (async ? 'async' : ''), function (id) {
		clearTimeout(cache[id]);
		if (preFetchCache && preFetchCache[id]) {
			clearTimeout(preFetchCache[id]);
			delete preFetchCache[id];
		}
		delete cache[id];
	});

	if (options.preFetch) {
		if (isNumber(options.preFetch)) {
			preFetchAge = max(min(Number(options.preFetch), 1), 0);
		} else {
			preFetchAge = 0.333;
		}
		if (preFetchAge) {
			preFetchCache = {};
			preFetchAge = (1 - preFetchAge) * maxAge;
			conf.on('hit' + (async ? 'async' : ''), function (id, args, ctx) {
				if (!preFetchCache[id]) {
					preFetchCache[id] = true;
					nextTick(function () {
						if (preFetchCache[id] === true) {
							delete preFetchCache[id];
							conf.clear(id);
							conf.memoized.apply(ctx, args);
						}
					});
				}
			});
		}
	}

	if (!async) {
		conf.on('purgeall', function () {
			forEach(cache, function (id) {
				clearTimeout(id);
			});
			cache = {};
			if (preFetchCache) {
				forEach(preFetchCache, function (id) {
					clearTimeout(id);
				});
				preFetchCache = {};
			}
		});
	}
};
