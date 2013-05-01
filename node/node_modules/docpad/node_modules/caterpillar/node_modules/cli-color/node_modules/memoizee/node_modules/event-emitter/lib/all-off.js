'use strict';

var value = require('es5-ext/lib/Object/valid-value')
  , id    = require('./_id');

module.exports = function (emitter) {
	var type, data;

	value(emitter);

	if (arguments[1] != null) {
		type = arguments[1];
		data = emitter.hasOwnProperty(id) && emitter[id];
		if (!data) {
			return;
		}
		if (data.hasOwnProperty(type)) {
			delete data[type];
		}
	} else if (emitter.hasOwnProperty(id)) {
		delete emitter[id];
	}
};
