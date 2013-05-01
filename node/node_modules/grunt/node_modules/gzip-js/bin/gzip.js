#!/usr/bin/env node
(function () {
	'use strict';

	var fs = require('fs'),
		optimist = require('optimist'),
		gzip = require('../lib/gzip.js'),
		argv,
		level,
		stat,
		out;

	argv = optimist.usage('Usage: $0 --level [1-9] --file [filename] --output [filename]')
			.alias({
				'f': 'file',
				'o': 'output',
				'l': 'level'
			})
			.default('level', gzip.DEFAULT_LEVEL)
			.demand(['file']).argv;

	stat = fs.statSync(argv.file);
	out = gzip.zip(fs.readFileSync(argv.file), {
		name: argv.file,
		level: argv.level,
		timestamp: parseInt(Math.round(stat.mtime.getTime() / 1000))
	});

	fs.writeFileSync(argv.output || argv.file + '.gz', new Buffer(out));
}());
