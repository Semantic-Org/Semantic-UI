'use strict';

var create = Object.create;

module.exports = function (t, a) {
	var x;
	a.deep(t(), {}, "No object");
	a.deep(t('raz'), {}, "Primitive");
	a.deep(t({ foo: 'raz', bar: 'dwa' }), { foo: 'raz', bar: 'dwa' }, "Plain");

	x = { raz: 'one', dwa: 'two' };
	x = create(x);
	x.trzy = 'three';
	x.cztery = 'four';
	x = create(x);
	x.dwa = 'two!';
	x.trzy = 'three!';
	x.piec = 'five';
	x.szesc = 'six';

	a.deep(t(x), { raz: 'one', dwa: 'two!', trzy: 'three!', cztery: 'four',
		piec: 'five', szesc: 'six' }, "Deep object");
};
