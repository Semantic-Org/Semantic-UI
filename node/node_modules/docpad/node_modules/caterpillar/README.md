# Caterpillar

[![Build Status](https://secure.travis-ci.org/bevry/caterpillar.png?branch=master)](http://travis-ci.org/bevry/caterpillar)
[![NPM version](https://badge.fury.io/js/caterpillar.png)](https://npmjs.org/package/caterpillar)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Caterpillar is the ultimate logging system for Node.js, based on [transform streams](http://nodejs.org/api/stream.html#stream_class_stream_transform) you can log to it and pipe the output off to different locations, including [some pre-made ones](http://npmjs.org/keyword/caterpillar-transform). Caterpillar also supports log levels according to the [RFC standard](http://www.faqs.org/rfcs/rfc3164.html), as well as line, method, and file fetching for messages. You can even use it in web browsers with the [Browser Transform](https://github.com/bevry/caterpillar-browser).



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save caterpillar`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example with the [Filter](https://github.com/bevry/caterpillar-filter) and [Human](https://github.com/bevry/caterpillar-filter) transforms

``` javascript
// Import
var level  = process.argv.indexOf('-d') === -1 ? 6 : 7;
var logger = new (require('./').Logger)({level:level});
var filter = new (require('caterpillar-filter').Filter)();
var human  = new (require('caterpillar-human').Human)();

// Pipe logger output to filter, then filter output to stdout
logger.pipe(filter).pipe(human).pipe(process.stdout);

// If we are debugging, then write the original logger data to debug.log
if ( level === 7 ) {
	logger.pipe(require('fs').createWriteStream('./debug.log'));
}

// Log messages
logger.log('emergency', 'this is level 0');
logger.log('emerg', 'this is level 0');
logger.log('alert', 'this is level 1');
logger.log('critical', 'this is level 2');
logger.log('crit', 'this is level 2');
logger.log('error', 'this is level 3');
logger.log('err', 'this is level 3');
logger.log('warning', 'this is level 4');
logger.log('warn', 'this is level 4');
logger.log('notice', 'this is level 5');
logger.log('note', 'this is level 5');
logger.log('info', 'this is level 6');
logger.log('default', 'this is level 6');
logger.log('debug', 'this is level 7');
logger.log('this is level 6, the default level');
logger.log('you','can','also','use','as','many','arguments','as','you','want',1,[2,3],{four:5});
```

Result with log level 6 (info):

<img src="https://github.com/bevry/caterpillar/raw/master/media/caterpillar-normal.png"/>


Result with log level 7 (debug):

<img src="https://github.com/bevry/caterpillar/raw/master/media/caterpillar-debug.png"/>


### Transform API, extends [stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform)

``` javascript
new (require('caterpillar').Transform)(config)
```

- Methods
	- `constructor(config?)` create our new instance with the config, config is optional
	- `pipe(child)` pipe our stream to the child, also sync our config to it
	- `setConfig(config)` set the configuration and emit the `config` event
	- `getConfig()` get the configuration
	- `format(entry)` format the caterpillar logger entry
- Configuration
	- none by default
- Events
	- `config(config)` emitted once our configuration has updated


### Logger API, extends Transform API

``` javascript
new (require('caterpillar').Logger)(config)
```

- Methods
	- `constructor(config?)` create our new instance with the config, config is optional
	- `log(args...)` write a log message, the first argument is suppose to be the level (will use the default level if it isn't)
	- `format(level, args...)` create a log entry ready for writing to the logger stream, output is as follows:

		``` javascript
		{
			"args": ["this is emergency and is level 0"],
			"date": "2013-04-25T10:18:25.722Z",
			"levelNumber": 0,
			"levelName": "emergency",
			"line": "59",
			"method": "Task.fn",
			"file": "/Users/balupton/Projects/caterpillar/out/test/caterpillar-test.js"
		}
		```

	- `getLevelNumber(name)` get the level number for the level name
	- `getLevelName(number)` get the level name for the level number
	- `getLevelInfo(nameOrNumber)` get the level name and number for either a level name or number
	- `getLineInfo()` get the file, method, and line that the `log` method was called on

- Configuration
	- `levels` the level names and their associated number, also includes `default` for when no level was specified, defaults to:
	
		``` javascript
		{
			emergency: 0,
			alert: 1,
			critical: 2,
			error: 3,
			warning: 4,
			notice: 5,
			info: 6,
			debug: 7,

			emerg: 0,
			crit: 2,
			err: 3,
			warn: 4,
			note: 5,

			default: 6
		}
		```

- Events
	- only those inherited



## History
You can discover the history inside the [History.md](https://github.com/bevry/caterpillar/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)



## Thanks
Uses the following:

- [RFC3164](http://www.faqs.org/rfcs/rfc3164.html) for the level codes and names

Inspired by the following:

- [Alexander Dorofeev's](https://github.com/akaspin) [AIN](https://github.com/akaspin/ain)
- [TJ Holowaychuk's](https://github.com/visionmedia) [Log.js](https://github.com/visionmedia/log.js)
- [Igor Urminček's](https://github.com/igo) [NLogger](https://github.com/igo/nlogger)
- [SchizoDuckie's](https://github.com/SchizoDuckie) [Node-CLI](https://github.com/SchizoDuckie/Node-CLI/)
