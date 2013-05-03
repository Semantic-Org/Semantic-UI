'use strict';

module.exports = function (t, a) {
	a(t({ bar: 'dwa', foo: 'raz' }, function (a, b, key, obj) {
		return a + b + key + obj.bar;
	}, t.NO_INITIAL, true), 'dwarazfoodwa', "No initial");
	a(t({ bar: 'dwa', foo: 'raz' }, function (a, b, key, obj) {
		return a + b + key + obj.bar + '|';
	}, 'other', true), 'otherdwabardwa|razfoodwa|', "Initial");
};
