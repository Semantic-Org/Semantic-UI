[![Build Status](https://secure.travis-ci.org/vesln/package.png)](http://travis-ci.org/vesln/package)

# package - Easy package.json exports.

## Intro

This module provides an easy and simple way to export package.json data.

## Installation

	$ npm install package

## Usage

	var package = require('package')(module); // contains package.json data.
	var yourAwesomeModule = {};
	yourAwesomeModule.version = package.version;

## Tests

	$ make test

## Contribution

Bug fixes and features are welcomed.

## Other similar modules

- pkginfo (https://github.com/indexzero/node-pkginfo) by indexzero.
- JSON.parse + fs.readFile

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