'use strict';

var startsWith = require('es5-ext/lib/String/prototype/starts-with')
  , spawn      = require('child_process').spawn

  , pg = __dirname + '/__playground';

module.exports = {
	"": function (a, d) {
		var t = spawn(pg + '/throbber.js')
		  , out = [], err = '';

		t.stdout.on('data', function (data) {
			out.push(data);
		});
		t.stderr.on('data', function (data) {
			err += data;
		});
		t.on('exit', function () {
			a.ok(out.length > 4, "Interval");
			a(startsWith.call(out.join(""), "START-\b\\\b|\b/\b-\b"), true, "Output");
			a(err, "", "No stderr output");
			d();
		});
	},
	"Formatted": function (a, d) {
		var t = spawn(pg + '/throbber.formatted.js')
		  , out = [], err = '';

		t.stdout.on('data', function (data) {
			out.push(data);
		});
		t.stderr.on('data', function (data) {
			err += data;
		});
		t.on('exit', function () {
			a.ok(out.length > 4, "Interval");
			a(startsWith.call(out.join(""), "START\x1b[31m-\x1b[39m\b\x1b[31m\\\x1b" +
				"[39m\b\x1b[31m|\x1b[39m\b\x1b[31m/\x1b[39m\b\x1b[31m-\x1b[39m\b"),
				true, "Output");
			a(err, "", "No stderr output");
			d();
		});
	}
};
