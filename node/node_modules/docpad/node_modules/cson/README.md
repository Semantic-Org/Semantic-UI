# CSON

[![Check this project's build status on TravisCI](https://secure.travis-ci.org/bevry/cson.png?branch=master)](http://travis-ci.org/bevry/cson)
[![View this project's NPM page](https://badge.fury.io/js/cson.png)](https://npmjs.org/package/cson)
[![Donate monthly to this project via Flattr](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)
[![Donate once-off to this project via Paypal](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/au/cgi-bin/webscr?cmd=_flow&SESSION=IHj3DG3oy_N9A9ZDIUnPksOi59v0i-EWDTunfmDrmU38Tuohg_xQTx0xcjq&dispatch=5885d80a13c0db1f8e263663d3faee8d14f86393d55a810282b64afed84968ec)

CoffeeScript-Object-Notation Parser. Same as JSON but for CoffeeScript objects.


## What is CSON?

Everyone knows JSON, it's the thing that looks like this:

``` javascript
{
	"abc": [
		"a",
		"b",
		"c"
	],
	"a": {
		"b": "c"
	}
}
```

But with the invention of CoffeeScript you can also write the same thing in CSON which looks like this:

``` coffeescript
{
	# an array
	abc: [
		'a'
		'b'
		'c'
	]

	# an object
	a:
		b: 'c'
}
```

Which is far more lenient than JSON, nicer to write and read, you don't have to quote everything, you have comments, and won't fail if you forget a comma.



## Installing


1. [Install Node.js](https://github.com/balupton/node/wiki/Installing-Node.js)

2. Install CSON

	``` bash
	npm install cson
	```


## Using CSON


- With Node.js in JavaScript

	``` javascript
	// Include CSON
	CSON = require('cson');

	// Parse a file path
	CSON.parseFile('data.cson', function(err,obj){});  // async
	result = CSON.parseFileSync('data.cson');  // sync

	// Parse a String
	CSON.parse(src, function(err,obj){});  // async
	result = CSON.parseSync(src);  // sync

	// Stringify an object to CSON
	CSON.stringify(obj, function(err,str){});  // async
	result = CSON.stringifySync(obj);  // sync
	```


- With Node.js in CoffeeScript

	``` coffeescript
	# Include CSON
	CSON = require('cson')

	# Parse a file path
	CSON.parseFile 'data.cson', (err,obj) ->  # async
	result = CSON.parseFile('data.cson')  # sync

	# Parse a string
	CSON.parse src, (err,obj) ->  # async
	result = CSON.parseSync(src)  # sync

	# Stringify an object to CSON
	CSON.stringify data, (err,str) ->  # async
	result = CSON.stringifySync(obj)  # sync


- Via the command line (requires a global installation of CSON via `npm install -g cson`)

	``` bash
	# JSON file to CSON String
	json2cson filePath > out.cson

	# CSON file to JSON String
	cson2json filePath > out.json
	```


## History
[You can discover the version history inside the `History.md` file](https://github.com/bevry/cson/blob/master/History.md#files)


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
