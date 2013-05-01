
var connect = require('./');
var app = connect();

app.use(connect.logger('dev'));
app.use(connect.bodyParser());

app.use(function(req, res, next){
  if (req.checkContinue) {
    res.writeContinue();
  }
  res.end('hello');
});

var server = app.listen(3000);

server.on('checkContinue', function(req, res){
  req.checkContinue = true;
  app(req, res);
});


// var http = require('http');

// var app = http.createServer(function(req, res){
//   console.log(req.headers);
// });

// app.on('checkContinue', function(req, res){
//   if ('application/json' == req.headers['content-type']) {
//     res.writeContinue();
//     console.log('ok');
//     res.end('thanks')
//   } else {
//     res.writeHead(400);
//     res.end('bad request, json only');
//   }
// });

// app.listen(3000);
