Intro
=====

Does deflate compression/decompression in the browser and node.

This module is not meant to be run on node for any production code. The native version of deflate should be used instead because it is much faster.  The main reason for this being node-compatible is for testing purposes.

Currently deflate does not pass all tests, but inflate does. This should not be used for compressing data yet in production.

Install
=======

For node, deflate-js can be installed with npm: `npm install deflate-js`

For the browser, deflate-js can be installed with pakmanager.

API
===

Deflate:

> *deflate(arr[, level])*
> 
> **arr**- Byte array to compress
> 
> **level**- 1-9 (compression level; optional)

Inflate:

> *inflate(arr)*
> 
> 
> **arr**- Byte array to decompress

The basic usage (no level) will suffice for most purposes.

Basic Usage
-----------

    var deflate = require('deflate-js'),
		arr;

	arr = Array.prototype.map.call('Hello world', function (char) {
		return char.charCodeAt(0);
	});

	// compress some text
	var compressed = deflate.deflate(arr);

	// decompress some text
	var decompressed = deflate.inflate(compressed);
