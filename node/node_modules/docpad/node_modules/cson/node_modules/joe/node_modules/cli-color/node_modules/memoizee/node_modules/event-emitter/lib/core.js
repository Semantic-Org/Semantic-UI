'use strict';

var d        = require('es5-ext/lib/Object/descriptor')
  , callable = require('es5-ext/lib/Object/valid-callable')
  , id       = require('./_id')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties

  , on, once, off, emit
  , colId, onceTag, methods, descriptors, base;

colId = id + 'l_';

on = function (type, listener) {
	var data;

	callable(listener);

	if (!this.hasOwnProperty(id)) {
		defineProperty(this, id, d(data = {}));
	} else {
		data = this[id];
	}
	if (!data.hasOwnProperty(type)) {
		data[type] = listener;
	} else if (data[type].hasOwnProperty(colId)) {
		data[type].push(listener);
	} else {
		(data[type] = [data[type], listener])[colId] = true;
	}

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once._listener = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!this.hasOwnProperty(id)) {
		return this;
	}
	data = this[id];
	if (!data.hasOwnProperty(type)) {
		return this;
	}
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) || (candidate._listener === listener)) {
				if (listeners.length === 2) {
					data[type] = listeners[i ? 0 : 1];
				} else {
					listeners.splice(i, 1);
				}
			}
		}
	} else {
		if ((listeners === listener) || (listeners._listener === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var data, i, l, listener, listeners, args;

	if (!this.hasOwnProperty(id)) {
		return;
	}
	data = this[id];
	if (!data.hasOwnProperty(type)) {
		return;
	}
	listeners = data[type];

	if (listeners.hasOwnProperty(colId)) {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) {
			args[i - 1] = arguments[i];
		}

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;
