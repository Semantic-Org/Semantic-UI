
var fs        = require('fs');
var qs        = require('qs');
var path      = require('path');
var util      = require('util');
var http      = require('http');
var events    = require('events');
var parse     = require('url').parse;
var debug     = require('debug')('tinylr:server');
var Client    = require('./client');
var constants = require('constants');

var config = require('../package.json');

module.exports = Server;

function Server(options) {
  options = this.options = options || {};
  events.EventEmitter.call(this);

  options.livereload = options.livereload || path.join(__dirname, 'public/livereload.js');
  options.port = parseInt(options.port || 35729, 10);

  this.on('GET /', this.index.bind(this));
  this.on('GET /changed', this.changed.bind(this));
  this.on('POST /changed', this.changed.bind(this));
  this.on('GET /livereload.js', this.livereload.bind(this));
  this.on('GET /kill', this.close.bind(this));

  this.clients = {};

  this.configure(options.app);
}

util.inherits(Server, events.EventEmitter);

Server.prototype.configure = function configure(app) {
  debug('Configuring %s', app ? 'connect / express application' : 'HTTP server');

  if(!app) {
    this.server = http.createServer(this.handler.bind(this));
    this.server.on('upgrade', this.websocketify.bind(this));
    this.server.on('error', this.error.bind(this));
    return this;
  }


  var self = this;
  this.app = app;

  this.app.listen = function(port, done) {
    done = done || function() {};
    if(port !== self.options.port) {
      debug('Warn: LiveReload port is not standard (%d). You are listening on %d', self.options.port, port);
      debug('You\'ll need to rely on the LiveReload snippet');
      debug('> http://feedback.livereload.com/knowledgebase/articles/86180-how-do-i-add-the-script-tag-manually-');
    }

    var srv = self.server = http.createServer(app);
    srv.on('upgrade', self.websocketify.bind(self));
    srv.on('error', self.error.bind(self));
    srv.on('close', self.close.bind(self));
    return srv.listen(port, done);
  };

  return this;
};

Server.prototype.handler = function handler(req, res, next) {
  var middleware = typeof next === 'function';
  debug('LiveReload handler %s (middleware: %s)', req.url, middleware ? 'on' : 'off');

  if(middleware) {
    if(!req.params && req.query) req.params = req.query;
    this.handle(req, res, next);
    return this;
  }

  req
    .on('end', this.handle.bind(this, req, res))
    .on('data', function(chunk) {
      req.data = req.data || '';
      req.data += chunk;
    });

  return this;
};

Server.prototype.handle = function handle(req, res, next) {
  var url = parse(req.url);
  var middleware = typeof next === 'function';

  req.body = {};
  req.params = {};

  try {
    req.body = JSON.parse(req.data);
  } catch(e) {}

  if(url.query) req.params = qs.parse(url.query);

  // todo: parse Accept header
  res.setHeader('Content-Type', 'application/json');

  // do the routing
  var route = req.method + ' '  + url.pathname;
  var respond = this.emit(route, req, res);
  if(respond) return;
  if(middleware) return next();

  res.writeHead(404);
  res.write(JSON.stringify({
    error: 'not_found',
    reason: 'no such route'
  }));
  res.end();
};

Server.prototype.websocketify = function websocketify(req, socket, head) {
  var self = this;
  var client = new Client(req, socket, head);
  this.clients[client.id] = client;

  debug('New LiveReload connection (id: %s)', client.id);
  client.on('end', function() {
    debug('Destroy client %s (url: %s)', client.id, client.url);
    delete self.clients[client.id];
  });
};

Server.prototype.listen = function listen(port, fn) {
  this.port = port;
  this.server.listen(port, fn);
};

Server.prototype.close = function close(req, res) {
  if(res) res.end();

  Object.keys(this.clients).forEach(function(id) {
    this.clients[id].close();
  }, this);

  if(this.server._handle) this.server.close(this.emit.bind(this, 'close'));
};

Server.prototype.error = function error(e) {
  console.error();
  console.error('... Uhoh. Got error %s ...', e.message);
  console.error(e.stack);

  if(e.code !== constants.EADDRINUSE) return;
  console.error();
  console.error('You already have a server listening on %s', this.port);
  console.error('You should stop it and try again.');
  console.error();
};

// Routes

Server.prototype.livereload = function livereload(req, res) {
  fs.createReadStream(this.options.livereload).pipe(res);
};

Server.prototype.changed = function changed(req, res) {
  var files = [];
  if(req && req.body && req.body.files) files = req.body.files;
  if(req && req.params && req.params.files) files = req.params.files;

  // normalize files array
  files = Array.isArray(files) ? files :
    typeof files === 'string' ? files.split(/[\s,]/) :
    [];


  debug('Changed event (Files: %s)', files.join(' '));
  var clients = Object.keys(this.clients).map(function(id) {
    var client = this.clients[id];
    debug('Reloading client %s (url: %s)', client.id, client.url);
    client.reload(files);
    return {
      id: client.id,
      url: client.url
    };
  }, this);

  if(!res) return;

  res.write(JSON.stringify({
    clients: clients,
    files: files
  }));

  res.end();
};

Server.prototype.index = function index(req, res) {
  res.write(JSON.stringify({
    tinylr: 'Welcome',
    version: config.version
  }));

  res.end();
};
