'use strict';

module.exports = function (t, a) {
	a(t.call(' %a%aab%abb%b\\%aa%ab%c%c ', { a: 'A', aa: 'B', ab: 'C', b: 'D',
		c: function () { return ++this.a; } }, { a: 0 }), ' ABbCbD%aaC12 ');
};
