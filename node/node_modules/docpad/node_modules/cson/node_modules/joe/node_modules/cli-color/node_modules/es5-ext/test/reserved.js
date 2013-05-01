'use strict';

var contains = require('../lib/Array/prototype/contains');

module.exports = function (t, a) {
	a(contains.call(t.keywords, 'break'), true,
		"Keywords hash has reserved keyword");
	a(contains.call(t.keywords, 'class'), false,
		"Keywords hash has not future reserved word");
	a(contains.call(t.keywords, 'let'), false,
		"Keywords hash has not future strict reserved word");
	a(contains.call(t.future, 'break'), false,
		"Future reserved hash has not reserved keyword");
	a(contains.call(t.future, 'class'), true,
		"Future reserved hash has future reserved word");
	a(contains.call(t.future, 'let'), false,
		"Future reserved hash has not future strict reserved word");
	a(contains.call(t.futureStrict, 'break'), false,
		"Future strict reserved hash has not reserved keyword");
	a(contains.call(t.futureStrict, 'class'), false,
		"Future strict reserved hash has not future reserved word");
	a(contains.call(t.futureStrict, 'let'), true,
		"Future reserved hash has future strict reserved word");
	a(contains.call(t, 'break'), true,
		"All reserved keywords hash has reserved keyword");
	a(contains.call(t, 'class'), true,
		"All reserved keywords hash has future reserved word");
	a(contains.call(t, 'let'), true,
		"All reserved keywords hash has future strict reserved word");
};
