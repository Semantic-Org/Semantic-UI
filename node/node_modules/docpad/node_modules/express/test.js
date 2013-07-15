var http = require('http');
var express = require('express');

var app = express();
var sub = express();

app.use('/', function (req, res, next) {
  next(new Error('something broke'));
});

sub.use(function (err, req, res, next) {
  res.send('error handled');
});

app.use(sub);

http.createServer(app).listen(4000);
