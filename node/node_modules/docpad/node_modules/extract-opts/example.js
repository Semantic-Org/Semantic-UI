var extractOpts = require('./').extractOpts;

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