#!/usr/bin/env node
(function () {
	'use strict';

	var fs = require('fs'),
		path = require('path'),
		optimist = require('optimist'),
		deflate = require('../index'),
		argv,
		out;

	argv = optimist.usage('Usage: $0 --file [filename] --level [1-9] --output [filename]')
			.alias({
				'f': 'file',
				'o': 'output',
				'l': 'level'
			}).default({
				'level': deflate.deflate.DEFAULT_LEVEL
			}).demand(['file']).argv;

	out = deflate.deflate(fs.readFileSync(argv.file), argv.level);

	if (!argv.output) {
		argv.output = path.basename(argv.file) + '.deflate';
	}
	fs.writeFileSync(argv.output, new Buffer(out));
}());
