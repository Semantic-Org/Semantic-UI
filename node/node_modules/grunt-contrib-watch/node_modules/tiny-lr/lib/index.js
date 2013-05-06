
var Server = require('./server');
var Client = require('./client');

module.exports = tinylr;
tinylr.Server = Server;
tinylr.Client = Client;

tinylr.middleware = middleware;

function tinylr(opts) {
  return new Server(opts);
}

var util = require('util');

function middleware(opts) {
  var srv = new Server(opts);
  return function tinylr(req, res, next) {
    srv.handler(req, res, next);
  };
}
