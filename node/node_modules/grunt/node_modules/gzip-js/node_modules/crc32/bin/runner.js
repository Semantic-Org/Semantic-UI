#!/usr/bin/env node
(function () {
	'use strict';

	var fs = require('fs'),
		path = require('path'),
		crc32 = require('../lib/crc32'),
		name = (process.argv[1].indexOf(__filename) < 0 ? '' : 'node ') + path.basename(process.argv[1]),
		usage = [
			'Usage:',
			'',
			name + ' file1.txt [, file2.txt...]'
		].join('\n'),
		files;

	if (process.argv.length === 2) {
		console.log(usage);
		return;
	}

	// get just the files
	files = process.argv.slice(2);

	files.forEach(function (file) {
		var data;

		try {
			data = fs.readFileSync(file);
			console.log(crc32(data));
		} catch (e) {
			console.error('Error reading file:', file);
		}
	});
}());
