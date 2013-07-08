# Extract Opts

[![Build Status](https://secure.travis-ci.org/bevry/extract-opts.png?branch=master)](http://travis-ci.org/bevry/extract-opts)
[![NPM version](https://badge.fury.io/js/extract-opts.png)](https://npmjs.org/package/extract-opts)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Extract the options and callback from a function's arguments easily



## Install

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save extract-opts`



## Usage

``` javascript
var extractOpts = require('extract-opts').extractOpts;

// fs.readFile(filename, [options], callback)
var readFile = function(filename, opts, callback){
	// Extract options and callback
	var args = extractOpts(opts, callback);
	opts = args[0];
	callback = args[1];

	// Forward for simplicities sake
	require('fs').readFile(filename, opts, callback);
};

// Test it
var next = console.log.bind(console);
readFile('package.json', next);         // works with no options
readFile('package.json', null, next);   // works with null options
readFile('package.json', {next:next});  // works with just options
```



## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/extract-opts/blob/master/History.md#files)



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
