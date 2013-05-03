# Filter Transform for [Caterpillar](https://github.com/bevry/caterpillar)

[![Build Status](https://secure.travis-ci.org/bevry/caterpillar-filter.png?branch=master)](http://travis-ci.org/bevry/caterpillar-filter)
[![NPM version](https://badge.fury.io/js/caterpillar-filter.png)](https://npmjs.org/package/caterpillar-filter)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Filter out undesired log levels from your [Caterpillar](https://github.com/bevry/caterpillar) logger stream



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save caterpillar-filter`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example

``` javascript
// Import
var logger = require('caterpillar').create();
var filter = require('caterpillar-filter').create({level:6});  // omit log level entries above 6

// Pipe logger output to filter, then filter output to stdout
logger.pipe(filter).pipe(process.stdout);

// Log
logger.log('info',  'this is the first log entry');   // info is level 6
logger.log('debug', 'this is the second log entry');  // debug is level 7, this will be omitted by our filter
logger.log('info',  'this is the third log entry');   // info is level 6

// Outputs
// {"args":["this is the first log entry"],"date":"2013-04-25T08:48:38.941Z","levelCode":6,"levelName":"info","line":"9","method":"Object.<anonymous>","file":"/Users/balupton/Projects/caterpillar-filter/example.js"}
// {"args":["this is the third log entry"],"date":"2013-04-25T08:48:38.948Z","levelCode":6,"levelName":"info","line":"11","method":"Object.<anonymous>","file":"/Users/balupton/Projects/caterpillar-filter/example.js"}
```

### Filter API, extends [caterpillar.Transform](https://github.com/bevry/caterpillar), which extends [stream.Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform)

``` javascript
new (require('caterpillar-filter').Filter)(config)
```

- Methods
	- `constructor(config?)` create our new filter instance with the config, config is optional
	- `pipe(child)` pipe our stream to the child, also sync our config to it
	- `setConfig(config)` set the configuration and emit the `config` event
	- `getConfig()` get the configuration
	- `format(entry)` format the caterpillar logger entry
- Configuration
	- `level` number, defaults to `6`, anything higher will be omitted
- Events
	- `config(config)` emitted once our configuration has updated



## History
You can discover the history inside the [History.md](https://github.com/bevry/caterpillar-filter/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
