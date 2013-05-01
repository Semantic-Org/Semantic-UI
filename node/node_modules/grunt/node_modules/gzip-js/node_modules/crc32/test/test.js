(function () {
	var fs = require('fs'),
		path = require('path'),
		crc32 = require('../lib/crc32'),
		testDir = './testFiles',
		checkFile,
		checkValues,
		usage = [
			'Usage:',
			'',
			'node test.js checkFile.json [/path/to/testFiles]'
		].join('\n'),
		failed = false;

	checkFile = process.argv[2];
	if (process.argv.length === 4) {
		testDir = process.argv[3];
	}

	if (!checkFile) {
		console.log(usage);
		return;
	}

	try {
		checkValues = fs.readFileSync(checkFile, 'utf8');
	} catch (e) {
		console.error('Unable to read ' + checkFile);
		return;
	}

	try {
		checkValues = JSON.parse(checkValues);
		Object.keys(checkValues).forEach(function (key) {
			checkValues[key] = parseInt(checkValues[key]).toString(16);
		});
	} catch (e) {
		console.error('Unable to parse contents of ' + checkFile + ' as JSON.');
		console.error(checkValues);
		return;
	}
	
	fs.readdirSync(testDir).forEach(function (file) {
		var data = fs.readFileSync(path.join(testDir, file)),
			tableRes = crc32(data),
			directRes = crc32(data, true),
			appendRes,
			arr;

		if (tableRes !== directRes) {
			console.log(file + ':',  'FAILED', '-', 'Results for table mode and direct mode');
			failed = true;
			return;
		}

		if (file in checkValues) {
			if (tableRes !== checkValues[file]) {
				failed = true;
				console.log(file + ':', 'FAILED', '-', 'Results do not match {val = ' + tableRes + ', actual = ' + checkValues[file] + '}');
				return;
			}
		} else {
			console.warn('No check value for ' + file);
		}

		// run append test

		// clear any previous data
		crc32.table();

		// convert Buffer to byte array
		arr = Array.prototype.map.call(data, function (byte) {
			return byte;
		});

		// run in append mode in 10 byte chunks
		while (arr.length) {
			appendRes = (crc32.table(arr.splice(0, 10), true) >>> 0).toString(16);
		}

		if (appendRes !== tableRes) {
			console.log(file + ':', 'FAILED', '-', 'Append mode output not correct');
			console.log(appendRes, tableRes);
			return;
		}

		console.log(file + ':', 'PASSED');
	});

	console.log();
	console.log(failed ? 'Tests failed =\'(' : 'All tests passed!! =D');
}());
