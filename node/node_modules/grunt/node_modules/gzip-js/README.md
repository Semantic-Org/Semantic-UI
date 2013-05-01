Intro
=====

*gzip-js* is a pure JavaScript implementation of the GZIP file format. It uses the DEFLATE algorithm for compressing data.

Please note that since this is a pure JavaScript implementation, it should NOT be used on the server for production code. It also does not comply 100% with the standard, yet.

The main goal of this project is to bring GZIP compression to the browser.

API
===

There is only one function so far, zip:

function zip(data[, options])
 
* data- String of text or byte array to compress
* options- object with options; options include:
  * level- compression level (1-9); default 6
  * timestamp- UNIX timestamp (seconds); if omitted, the current time will be used
  * name- optional; original name of the file

Sample usage:

    var gzip = require('gzip-js'),
		options = {
			level: 3,
			name: 'hello-world.txt',
			timestamp: parseInt(Date.now() / 1000, 10)
		};

	// out will be a JavaScript Array of bytes
	var out = gzip.zip('Hello world', options);
