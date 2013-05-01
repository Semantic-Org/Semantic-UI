// Reference counter, useful for garbage collector like functionality

'use strict';

var ext = require('../_base').ext;

ext.refCounter = function (ignore, conf, options) {
	var cache, async;

	cache = {};
	async = options.async && ext.async;

	conf.on('init' + (async ? 'async' : ''), async ? function (id, length) {
		cache[id] = length;
	} : function (id) { cache[id] = 1; });
	conf.on('hit' + (async ? 'async' : ''), function (id) { ++cache[id]; });
	conf.on('purge' + (async ? 'async' : ''), function (id) {
		delete cache[id];
	});
	if (!async) {
		conf.on('purgeall', function () { cache = {}; });
	}

	conf.memoized.clearRef = function () {
		var id = conf.get(arguments);
		if (cache.hasOwnProperty(id)) {
			if (!--cache[id]) {
				conf.clear(id);
				return true;
			}
			return false;
		}
		return null;
	};
};
