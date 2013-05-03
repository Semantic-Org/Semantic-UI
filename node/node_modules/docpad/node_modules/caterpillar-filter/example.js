// Import
var logger = new (require('caterpillar').Logger)();
var filter = new (require('./').Filter)({level:6});  // omit log level entries above 6

// Pipe logger output to filter, then filter output to stdout
logger.pipe(filter).pipe(process.stdout);

// Log
logger.log('info',  'this is the first log entry');   // info is level 6
logger.log('debug', 'this is the second log entry');  // debug is level 7, this will be omitted by our filter
logger.log('info',  'this is the third log entry');   // info is level 6

// Outputs
// {"args":["this is the first log entry"],"date":"2013-04-25T08:48:38.941Z","levelCode":6,"levelName":"info","line":"9","method":"Object.<anonymous>","file":"/Users/balupton/Projects/caterpillar-filter/example.js"}
// {"args":["this is the third log entry"],"date":"2013-04-25T08:48:38.948Z","levelCode":6,"levelName":"info","line":"11","method":"Object.<anonymous>","file":"/Users/balupton/Projects/caterpillar-filter/example.js"}