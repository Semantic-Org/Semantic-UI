'use strict';

module.exports = function (t, a) {
	var o = { foo: 'bar' }, x = {};
	t('foo', x)(o);
	a(o.foo, x);
};
