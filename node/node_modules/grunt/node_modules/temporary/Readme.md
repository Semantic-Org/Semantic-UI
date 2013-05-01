[![Build Status](https://secure.travis-ci.org/vesln/temporary.png)](http://travis-ci.org/vesln/temporary)

# temporary - The lord of tmp.

## Intro

Temporary provides an easy way to create temporary files and directories.
It will create a temporary file/directory with a unique name.

## Features

- Generates unique name.
- Auto-discovers tmp dir.

## Installation

	$ npm install temporary

## Usage

	var Tempfile = require('temporary/file');
	var Tempdir = require('temporary/dir');
	var file = new Tempfile;
	var dir = new Tempdir;
	
	console.log(file.path); // path.
	console.log(dir.path); // path.
	
	file.unlink();
	dir.rmdir();

## Methods

### File

- File.readFile
- File.readFileSync
- File.writeFile
- File.writeFileSync
- File.open
- File.openSync
- File.close
- File.closeSync
- File.unlink
- File.unlinkSync

### Dir

- Dir.rmdir
- Dir.rmdirSync

## Tests

	$ make test

## Contribution

Bug fixes and features are welcomed.

## License

MIT License

Copyright (C) 2012 Veselin Todorov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.