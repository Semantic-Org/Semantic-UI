// Gathers statistical data, and provides them in convinient form

'use strict';

var partial  = require('es5-ext/lib/Function/prototype/partial')
  , forEach  = require('es5-ext/lib/Object/for-each')
  , pad      = require('es5-ext/lib/String/prototype/pad')

  , max = Math.max

  , stats = exports.statistics = {}, ext;

require('../_base').ext.profile = ext = function (conf) {
	var id, stack, data;
	stack = (new Error()).stack;
	if (!stack.split('\n').slice(3).some(function (line) {
			if ((line.indexOf('/memoizee/') === -1) &&
					(line.indexOf('/es5-ext/') === -1) &&
					(line.indexOf('/next/lib/fs/_memoize-watcher') === -1) &&
					(line.indexOf(' (native)') === -1)) {
				id  = line.replace(/\n/g, "\\n").trim();
				return true;
			}
		})) {
		id = 'unknown';
	}

	if (!stats[id]) {
		stats[id] = { initial: 0, cached: 0 };
	}
	data = stats[id];

	conf.on('init', function () { ++data.initial; });
	conf.on('hit', function () { ++data.cached; });
};
ext.force = true;

exports.log = function () {
	var initial, cached, time, ordered, ipad, cpad, ppad, toPrc, log;

	initial = cached = time = 0;
	ordered = [];

	toPrc = function (initial, cached) {
		if (!initial && !cached) {
			return '0.00';
		}
		return ((cached / (initial + cached)) * 100).toFixed(2);
	};

	log = "------------------------------------------------------------\n";
	log += "Memoize statistics:\n\n";

	forEach(stats, function (data, name) {
		initial += data.initial;
		cached += data.cached;
		ordered.push([name, data]);
	}, null, function (a, b) {
		return (this[b].initial + this[b].cached) -
			(this[a].initial + this[a].cached);
	});

	ipad = partial.call(pad, " ",
		max(String(initial).length, "Init".length));
	cpad = partial.call(pad, " ", max(String(cached).length, "Cache".length));
	ppad = partial.call(pad, " ", "%Cache".length);
	log += ipad.call("Init") + "  " +
		cpad.call("Cache") + "  " +
		ppad.call("%Cache") + "  Source location\n";
	log += ipad.call(initial) + "  " +
		cpad.call(cached) + "  " +
		ppad.call(toPrc(initial, cached)) + "  (all)\n";
	ordered.forEach(function (data) {
		var name = data[0];
		data = data[1];
		log += ipad.call(data.initial) + "  " +
			cpad.call(data.cached) + "  " +
			ppad.call(toPrc(data.initial, data.cached)) + "  " + name + "\n";
	});
	log += "------------------------------------------------------------\n";
	return log;
};
