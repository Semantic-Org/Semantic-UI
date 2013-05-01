var common = require('../common');
var airbrake = require(common.dir.root).createClient(common.key);
var assert = require('assert');
var http = require('http');

var server = http.createServer(function(req, res) {
  res.writeHead(500);
  res.end('something went wrong');
});

server.listen(common.port, function() {
  var err = new Error('test-notify');
  airbrake.serviceHost = 'localhost:' + common.port;

  airbrake.on('error', function(err) {
    assert.ok(/notification failed/i.test(err.message));
    server.close();
  });
  airbrake.notify(err);
});
