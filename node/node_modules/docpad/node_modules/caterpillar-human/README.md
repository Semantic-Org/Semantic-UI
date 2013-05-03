# Human Transform for [Caterpillar](https://github.com/bevry/caterpillar)

[![Build Status](https://secure.travis-ci.org/bevry/caterpillar-human.png?branch=master)](http://travis-ci.org/bevry/caterpillar-human)
[![NPM version](https://badge.fury.io/js/caterpillar-human.png)](https://npmjs.org/package/caterpillar-human)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Turn your [Caterpillar](https://github.com/bevry/caterpillar) logger stream into a beautiful readable format with colors and optional debug information



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save caterpillar-human`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example

``` javascript
// Import
var logger = new (require('caterpillar').Logger)();
var human = new (require('caterpillar-human').Human)();

// Pipe logger output to our human interface, then our human interface output to stdout
logger.pipe(human).pipe(process.stdout);

// Log
logger.log('warn',  'this is the first log entry');
// warn:  this is the first log entry
logger.log('info', 'this is the second log entry');
// info: this is the second log entry

// Wait
setTimeout(function(){
	// Set debug mode
	logger.setConfig({level:7});

	// Log
	logger.log('warn',  'this is the first log entry');
	// warn: this is the first log entry
	//	→ [2013-04-25 20:37:22.692] [/Users/balupton/Projects/caterpillar-human/example.js:20] [null._onTimeout]
	logger.log('info', 'this is the second log entry');
	// info: this is the second log entry
	//	→ [2013-04-25 20:37:22.693] [/Users/balupton/Projects/caterpillar-human/example.js:22] [null._onTimeout]
},0);
```

### Human API, extends [caterpillar.Transform](https://github.com/bevry/caterpillar), which extends [stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform)

``` javascript
new (require('caterpillar-human').Human)(config)
```

- Methods
	- `constructor(config?)` create our new human instance with the config, config is optional
	- `pipe(child)` pipe our stream to the child, also sync our config to it
	- `setConfig(config)` set the configuration and emit the `config` event
	- `getConfig()` get the configuration
	- `format(entry)` format the caterpillar logger entry
- Configuration
	- `level` number, defaults to `null`, when set to `7` (debug level) we will debug information with the log entries
	- `color` boolean, defaults to `true`, set to `false` to turn off colors
	- `colors` objects of the level to color mapping, defaults to:
		
		``` javascript
		{
			0: 'red',
			1: 'red',
			2: 'red',
			3: 'red',
			4: 'yellow',
			5: 'yellow',
			6: 'green',
			7: 'green'
		}
		```

- Events
	- `config(config)` emitted once our configuration has updated



## History
You can discover the history inside the [History.md](https://github.com/bevry/caterpillar-human/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
