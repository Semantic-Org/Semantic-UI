/*******************************
           Karma Task
 *******************************/

var
	gulp = require('gulp'),
	Server = require('karma').Server;
	;

module.exports = function(callback) {
	var server = new Server({
		configFile: __dirname + '/../karma.conf.js',
		singleRun: true
	});

	server.on('run_complete', function () {
		callback();
	});

	server.start();
};