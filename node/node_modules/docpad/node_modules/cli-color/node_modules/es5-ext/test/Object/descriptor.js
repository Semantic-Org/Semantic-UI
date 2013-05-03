'use strict';

var defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

module.exports = function (t, a) {
	var o, c, cg, cs, ce, ceg, ces, cew, cw, e, eg, es, ew, v, vg, vs, w, df, dfg
	  , dfs;

	o = Object.create(Object.prototype, {
		c: t('c', c = {}),
		cgs: t.gs('c', cg = function () {}, cs = function () {}),
		ce: t('ce', ce = {}),
		cegs: t.gs('ce', ceg = function () {}, ces = function () {}),
		cew: t('cew', cew = {}),
		cw: t('cw', cw = {}),
		e: t('e', e = {}),
		egs: t.gs('e', eg = function () {}, es = function () {}),
		ew: t('ew', ew = {}),
		v: t('', v = {}),
		vgs: t.gs('', vg = function () {}, vs = function () {}),
		w: t('w', w = {}),

		df: t(df = {}),
		dfgs: t.gs(dfg = function () {}, dfs = function () {})
	});

	a.throws(function () {
		t.gs('', {});
	}, "Not callable value");
	a.throws(function () {
		t.gs('', function () {}, true);
	}, "Two values, second not callable");

	return {
		c: function (a) {
			var d = getOwnPropertyDescriptor(o, 'c');
			a(d.value, c, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, true, "Configurable");
			a(d.enumerable, false, "Enumerable");
			a(d.writable, false, "Writable");

			d = getOwnPropertyDescriptor(o, 'cgs');
			a(d.value, undefined, "GS Value");
			a(d.get, cg, "GS Get");
			a(d.set, cs, "GS Set");
			a(d.configurable, true, "GS Configurable");
			a(d.enumerable, false, "GS Enumerable");
			a(d.writable, undefined, "GS Writable");
		},
		ce: function (a) {
			var d = getOwnPropertyDescriptor(o, 'ce');
			a(d.value, ce, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, true, "Configurable");
			a(d.enumerable, true, "Enumerable");
			a(d.writable, false, "Writable");

			d = getOwnPropertyDescriptor(o, 'cegs');
			a(d.value, undefined, "GS Value");
			a(d.get, ceg, "GS Get");
			a(d.set, ces, "GS Set");
			a(d.configurable, true, "GS Configurable");
			a(d.enumerable, true, "GS Enumerable");
			a(d.writable, undefined, "GS Writable");
		},
		cew: function (a) {
			var d = getOwnPropertyDescriptor(o, 'cew');
			a(d.value, cew, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, true, "Configurable");
			a(d.enumerable, true, "Enumerable");
			a(d.writable, true, "Writable");
		},
		cw: function (a) {
			var d = getOwnPropertyDescriptor(o, 'cw');
			a(d.value, cw, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, true, "Configurable");
			a(d.enumerable, false, "Enumerable");
			a(d.writable, true, "Writable");
		},
		e: function (a) {
			var d = getOwnPropertyDescriptor(o, 'e');
			a(d.value, e, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, false, "Configurable");
			a(d.enumerable, true, "Enumerable");
			a(d.writable, false, "Writable");

			d = getOwnPropertyDescriptor(o, 'egs');
			a(d.value, undefined, "GS Value");
			a(d.get, eg, "GS Get");
			a(d.set, es, "GS Set");
			a(d.configurable, false, "GS Configurable");
			a(d.enumerable, true, "GS Enumerable");
			a(d.writable, undefined, "GS Writable");
		},
		ew: function (a) {
			var d = getOwnPropertyDescriptor(o, 'ew');
			a(d.value, ew, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, false, "Configurable");
			a(d.enumerable, true, "Enumerable");
			a(d.writable, true, "Writable");
		},
		v: function (a) {
			var d = getOwnPropertyDescriptor(o, 'v');
			a(d.value, v, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, false, "Configurable");
			a(d.enumerable, false, "Enumerable");
			a(d.writable, false, "Writable");

			d = getOwnPropertyDescriptor(o, 'vgs');
			a(d.value, undefined, "GS Value");
			a(d.get, vg, "GS Get");
			a(d.set, vs, "GS Set");
			a(d.configurable, false, "GS Configurable");
			a(d.enumerable, false, "GS Enumerable");
			a(d.writable, undefined, "GS Writable");
		},
		w: function (a) {
			var d = getOwnPropertyDescriptor(o, 'w');
			a(d.value, w, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, false, "Configurable");
			a(d.enumerable, false, "Enumerable");
			a(d.writable, true, "Writable");
		},
		d: function (a) {
			var d = getOwnPropertyDescriptor(o, 'df');
			a(d.value, df, "Value");
			a(d.get, undefined, "Get");
			a(d.set, undefined, "Set");
			a(d.configurable, true, "Configurable");
			a(d.enumerable, false, "Enumerable");
			a(d.writable, true, "Writable");

			d = getOwnPropertyDescriptor(o, 'dfgs');
			a(d.value, undefined, "GS Value");
			a(d.get, dfg, "GS Get");
			a(d.set, dfs, "GS Set");
			a(d.configurable, true, "GS Configurable");
			a(d.enumerable, false, "GS Enumerable");
			a(d.writable, undefined, "GS Writable");
		},
		binder: function (a) {
			var o = {};
			defineProperty(o, 'foo', t.binder('foo',
				t(function () { return this; })));
			a((o.foo)(), o, "Single");

			defineProperties(o, t.binder({
				bar: t(function () { return this === o; }),
				bar2: t(function () { return this; })
			}));

			a.deep([(o.bar)(), (o.bar2)()], [true, o], "Multiple");
		}
	};
};
