'use strict';

module.exports = function (t, a) {
	var o = { foo: 'bar', bar: 3 };
	t('test')(o);
	a.deep(o, { foo: 'bar', bar: 3 }, "Not existing");
	t('foo')(o);
	a.deep(o, { bar: 3 }, "Existing");
};
