'use strict';

module.exports = function (t, a) {
	var o = { raz: 1, dwa: 2, trzy: 3 }
	  , o2 = {}, o3 = {}, arr, i = -1;

	t = t('forEach');
	t(o, function (value, name, self, index) {
		o2[name] = value;
		a(index, ++i, "Index");
		a(self, o, "Self");
		a(this, o3, "Scope");
	}, o3);
	a.deep(o2, o);

	arr = [];
	o2 = {};
	i = -1;
	t(o, function (value, name, self, index) {
		arr.push(value);
		o2[name] = value;
		a(index, ++i, "Index");
		a(self, o, "Self");
		a(this, o3, "Scope");
	}, o3, function (a, b) {
		return o[b] - o[a];
	});
	a.deep(o2, o, "Sort by Values: Content");
	a.deep(arr, [3, 2, 1], "Sort by Values: Order");

	arr = [];
	o2 = {};
	i = -1;
	t('raz', function (value, name, self, index) {
		arr.push(value);
		o2[name] = value;
		a(index, ++i, "Primitive: Index");
		a(typeof self, 'object', "Primitive: Self type");
		a(String(self), 'raz', "Primitive: Self value");
		a(this, o3, "Scope");
	}, o3, function (a, b) {
		return a - b;
	});
	a.deep(o2, Object('raz'), "Primitive: Sort by Values: Content");
	a.deep(arr, ['r', 'a', 'z'], "Primitive: Sort by Values: Order");
};
