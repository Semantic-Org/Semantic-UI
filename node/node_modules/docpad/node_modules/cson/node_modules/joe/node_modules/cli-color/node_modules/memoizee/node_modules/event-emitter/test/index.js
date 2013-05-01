'use strict';

module.exports = function (t, a) {
	var x = {}, y,  count, count2;

	// Basic check
	count = 0;
	t(x);
	x.on('foo', function () {
		++count;
	});
	x.emit('foo');

	a(count, 1, "Emitted");

	t.allOff(x);
	x.emit('foo');
	a(count, 1, "All Off");

	y = t();
	count = 0;
	count2 = 0;
	x.on('foo', function () {
		++count;
	});
	y.on('foo', function () {
		++count2;
	});
	t.pipe(x, y);
	x.emit('foo');
	a(count, 1, "Pipe: x emitted");
	a(count2, 1, "Pipe: y emitted");
};
