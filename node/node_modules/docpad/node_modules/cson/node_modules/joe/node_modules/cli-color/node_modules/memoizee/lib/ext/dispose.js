// Call dispose callback on each cache purge

'use strict';

var callable = require('es5-ext/lib/Object/valid-callable')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , ext      = require('../_base').ext

  , slice = Array.prototype.slice;

ext.dispose = function (dispose, conf, options) {
	var clear, async;

	callable(dispose);

	async = (options.async && ext.async);
	conf.on('purge' + (async ? 'async' : ''), clear =  async ? function (id) {
		var value = conf.async[id];
		delete conf.cache[id];
		dispose.apply(null, slice.call(value, 1));
	} : function (id) {
		var value = conf.cache[id];
		delete conf.cache[id];
		dispose(value);
	});

	if (!async) {
		conf.on('purgeall', function () {
			forEach(conf.cache, function (value, id) { clear(id); });
		});
	}
};
