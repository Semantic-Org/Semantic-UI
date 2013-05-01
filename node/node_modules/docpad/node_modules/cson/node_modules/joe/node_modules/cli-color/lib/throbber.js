'use strict';

var chain = require('es5-ext/lib/Function/prototype/chain')
  , write = process.stdout.write.bind(process.stdout)

  , chars = '-\\|/'
  , l     = chars.length
  , p;

p = {
	next: 0,
	write: write,
	throbbed: false,
	ontick: function () {
		if (this.throbbed) {
			write('\u0008');
		} else {
			this.throbbed = true;
		}
		this.write(chars[this.next++ % l]);
	},
	onstop: function () {
		if (this.throbbed) {
			write('\u0008');
			this.next = 0;
			this.throbbed = false;
		}
	}
};

module.exports = function (interval, formatting) {
	var o = Object.create(p);
	if (formatting) {
		o.write = chain.call(formatting, write);
	}
	interval.on('tick', o.ontick.bind(o));
	interval.on('stop', o.onstop.bind(o));
};
