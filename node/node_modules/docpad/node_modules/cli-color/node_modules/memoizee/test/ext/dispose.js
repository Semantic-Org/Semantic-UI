'use strict';

var memoize  = require('../../lib')
  , nextTick = require('next-tick');

module.exports = function () {
	return {
		"Regular": {
			"Sync": function (a) {
				var mfn, fn, i = 0, value = [], x, invoked;
				fn = function (x, y) {
					++i;
					return x + y;
				};
				mfn = memoize(fn, { dispose: function (val) { value.push(val); } });

				mfn(3, 7);
				mfn(5, 8);
				mfn(12, 4);
				a.deep(value, [], "Pre");
				mfn.clear(5, 8);
				a.deep(value, [13], "#1");
				value = [];
				mfn.clear(12, 4);
				a.deep(value, [16], "#2");

				value = [];
				mfn(77, 11);
				mfn.clearAll();
				a.deep(value, [10, 88], "Clear all");

				x = {};
				invoked = false;
				mfn = memoize(function () { return x; },
					{ dispose: function (val) { invoked = val; } });

				mfn.clear();
				a(invoked, false, "No args: Post invalid clear");
				mfn();
				a(invoked, false, "No args: Post cache");
				mfn.clear();
				a(invoked, x, "No args: Pre clear");
			},
			"Method": function (a) {
				var fn, i = 0, value = [];
				fn = function (x, y) {
					++i;
					return x + y;
				};
				Object.defineProperty(value, 'mfn', { value: memoize(fn, {
					method: 'mfn',
					dispose: function (val) { this.push(val); }
				}), configurable: true });

				value.mfn(3, 7);
				value.mfn(5, 8);
				value.mfn(12, 4);
				a.deep(value, [], "Pre");
				value.mfn.clear(5, 8);
				a.deep(value, [13], "#1");
				value.length = 0;
				value.mfn.clear(12, 4);
				a.deep(value, [16], "#2");

				value.length = 0;
				value.mfn(77, 11);
				value.mfn.clearAll();
				a.deep(value, [10, 88], "Clear all");
			},
			"Ref counter": function (a) {
				var mfn, fn, i = 0, value = [];
				fn = function (x, y) {
					++i;
					return x + y;
				};
				mfn = memoize(fn, { refCounter: true,
					dispose: function (val) { value.push(val); } });

				mfn(3, 7);
				mfn(5, 8);
				mfn(12, 4);
				a.deep(value, [], "Pre");
				mfn(5, 8);
				mfn.clearRef(5, 8);
				a.deep(value, [], "Pre");
				mfn.clearRef(5, 8);
				a.deep(value, [13], "#1");
				value = [];
				mfn.clearRef(12, 4);
				a.deep(value, [16], "#2");

				value = [];
				mfn(77, 11);
				mfn.clearAll();
				a.deep(value, [10, 88], "Clear all");
			},
			"Async": function (a, d) {
				var mfn, fn, u = {}, i = 0, value = [];
				fn = function (x, y, cb) {
					nextTick(function () {
						++i;
						cb(null, x + y);
					});
					return u;
				};

				mfn = memoize(fn, { async: true,
					dispose: function (val) { value.push(val); } });

				mfn(3, 7, function () {
					mfn(5, 8, function () {
						mfn(12, 4, function () {
							a.deep(value, [], "Pre");
							mfn.clear(5, 8);
							a.deep(value, [13], "#1");
							value = [];
							mfn.clear(12, 4);
							a.deep(value, [16], "#2");

							value = [];
							mfn(77, 11, function () {
								mfn.clearAll();
								a.deep(value, [10, 88], "Clear all");
								d();
							});
						});
					});
				});
			}
		},
		"Primitive": {
			"Sync": function (a) {
				var mfn, fn, i = 0, value = [];
				fn = function (x, y) {
					++i;
					return x + y;
				};
				mfn = memoize(fn, { dispose: function (val) { value.push(val); } });

				mfn(3, 7);
				mfn(5, 8);
				mfn(12, 4);
				a.deep(value, [], "Pre");
				mfn.clear(5, 8);
				a.deep(value, [13], "#1");
				value = [];
				mfn.clear(12, 4);
				a.deep(value, [16], "#2");

				value = [];
				mfn(77, 11);
				mfn.clearAll();
				a.deep(value, [10, 88], "Clear all");
			},
			"Ref counter": function (a) {
				var mfn, fn, i = 0, value = [];
				fn = function (x, y) {
					++i;
					return x + y;
				};
				mfn = memoize(fn, { refCounter: true,
					dispose: function (val) { value.push(val); } });

				mfn(3, 7);
				mfn(5, 8);
				mfn(12, 4);
				a.deep(value, [], "Pre");
				mfn(5, 8);
				mfn.clearRef(5, 8);
				a.deep(value, [], "Pre");
				mfn.clearRef(5, 8);
				a.deep(value, [13], "#1");
				value = [];
				mfn.clearRef(12, 4);
				a.deep(value, [16], "#2");

				value = [];
				mfn(77, 11);
				mfn.clearAll();
				a.deep(value, [10, 88], "Clear all");
			},
			"Async": function (a, d) {
				var mfn, fn, u = {}, i = 0, value = [];
				fn = function (x, y, cb) {
					nextTick(function () {
						++i;
						cb(null, x + y);
					});
					return u;
				};

				mfn = memoize(fn, { async: true,
					dispose: function (val) { value.push(val); } });

				mfn(3, 7, function () {
					mfn(5, 8, function () {
						mfn(12, 4, function () {
							a.deep(value, [], "Pre");
							mfn.clear(5, 8);
							a.deep(value, [13], "#1");
							value = [];
							mfn.clear(12, 4);
							a.deep(value, [16], "#2");

							value = [];
							mfn(77, 11, function () {
								mfn.clearAll();
								a.deep(value, [10, 88], "Clear all");
								d();
							});
						});
					});
				});
			}
		}
	};
};
