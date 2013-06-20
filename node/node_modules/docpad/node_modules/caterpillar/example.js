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