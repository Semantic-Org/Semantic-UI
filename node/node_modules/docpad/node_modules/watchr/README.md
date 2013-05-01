# Watchr &mdash; better file system watching for Node.js

[![Build Status](https://secure.travis-ci.org/bevry/watchr.png?branch=master)](http://travis-ci.org/bevry/watchr)
[![NPM version](https://badge.fury.io/js/watchr.png)](https://npmjs.org/package/watchr)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Watchr provides a normalised API the file watching APIs of different node versions, nested/recursive file and directory watching, and accurate detailed events for file/directory creations, updates, and deletions.

You install it via `npm install watchr` and use it via `require('watchr').watch(config)`. Available configuration options are:

- `path` a single path to watch
- `paths` an array of paths to watch
- `listener` a single change listener to fire when a change occurs
- `listeners` an array of listeners to fire when a change occurs, overloaded to accept the following values:
	- `changeListener` a single change listener
	- `[changeListener]` an array of change listeners
	- `{eventName:eventListener}` an object keyed with the event names and valued with a single event listener
	- `{eventName:[eventListener]}` an object keyed with the event names and valued with an array of event listeners
- `next` (optional, defaults to `null`) a completion callback to fire once the watchers have been setup, arguments are:
	- when using the `path` configuration option: `err, watcherInstance`
	- when using the `paths` configuration option: `err, [watcherInstance,...]` 
- `stat` (optional, defaults to `null`) a file stat object to use for the path, instead of fetching a new one
- `interval` (optional, defaults to `5007`) for systems that poll to detect file changes, how often should it poll in millseconds
- `persistent` (optional, defaults to `true`) whether or not we should keep the node process alive for as long as files are still being watched
- `duplicateDelay` (optional, defaults to `1000`) sometimes events will fire really fast, this delay is set in place so we don't fire the same event within the timespan. Set to falsey to perform no duplicate detection.
- `preferredMethods` (optional, defaults to `['watch','watchFile']`) which order should we prefer our watching methods to be tried?
- `ignorePaths` (optional, defaults to `false`) an array of full paths to ignore
- `ignoreHiddenFiles` (optional, defaults to `false`) whether or not to ignored files which filename starts with a `.`
- `ignoreCommonPatterns` (optional, defaults to `true`) whether or not to ignore common undesirable file patterns (e.g. `.svn`, `.git`, `.DS_Store`, `thumbs.db`, etc)
- `ignoreCustomPatterns` (optional, defaults to `null`) any custom ignore patterns that you would also like to ignore along with the common patterns

The following events are available to your via the listeners:

- `log` for debugging, receives the arguments `logLevel ,args...`
- `error` for gracefully listening to error events, receives the arguments `err`
- `watching` for when watching of the path has completed, receives the arguments `err, isWatching`
- `change` for listening to change events, receives the arguments `changeType, fullPath, currentStat, previousStat`, received arguments will be:
	- for updated files: `'update', fullPath, currentStat, previousStat`
	- for created files: `'create', fullPath, currentStat, null`
	- for deleted files: `'delete', fullPath, null, previousStat`


To wrap it all together, it would look like this:

``` javascript
// Require
var watchr = require('watchr');

// Watch a directory or file
console.log('Watch our paths');
watchr.watch({
	paths: ['path1','path2','path3'],
	listeners: {
		log: function(logLevel){
			console.log('a log message occured:', arguments);
		},
		error: function(err){
			console.log('an error occured:', err);
		},
		watching: function(err,watcherInstance,isWatching){
			if (err) {
				console.log("watching the path " + watcherInstance.path + " failed with error", err);
			} else {
				console.log("watching the path " + watcherInstance.path + " completed");
			}
		},
		change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
			console.log('a change event occured:',arguments);
		}
	},
	next: function(err,watchers){
		if (err) {
			return console.log("watching everything failed with error", err);
		} else {
			console.log('watching everything completed', watchers);
		}

		// Close watchers after 60 seconds
		setTimeout(function(){
			var i;
			console.log('Stop watching our paths');
			for ( i=0;  i<watchers.length; i++ ) {
				watchers[i].close();
			}
		},60*1000);
	}
});
```

You can test the above code snippet by running the following:

```
npm install -g watchr
watchr
```


## Support

Support can be found in the [GitHub Issue Tracker](https://github.com/bevry/watchr/issues)


## History

You can discover the history inside the [History.md](https://github.com/bevry/watchr/blob/master/History.md#files) file


## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
