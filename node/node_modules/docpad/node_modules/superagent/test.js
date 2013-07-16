
var http = require('http');
var formidable = require('formidable');
var express = require('express');
var request = require('./');

// var app = express();

// app.get('/', function(req, res){
//   res.set('Content-Type', 'multipart/form-data; boundary=awesome');
//   res.write('\r\n');
//   res.write('--awesome\r\n');
//   res.write('Content-Disposition: attachment; name="image"; filename="something.png"\r\n');
//   res.write('Content-Type: image/png\r\n');
//   res.write('\r\n');
//   res.write('some data');
//   res.write('\r\n--awesome\r\n');
//   res.write('Content-Disposition: form-data; name="name"\r\n');
//   res.write('Content-Type: text/plain\r\n');
//   res.write('\r\n');
//   res.write('tobi');
//   res.write('\r\n--awesome--');
//   res.end();
// });

// app.listen(4000)

// http.createServer(function(req, res){
//   res.setHeader('Content-Type', 'multipart/form-data; boundary=awesome');
//   res.write('\r\n');
//   res.write('--awesome\r\n');
//   res.write('Content-Disposition: attachment; name="image"; filename="something.png"\r\n');
//   res.write('Content-Type: image/png\r\n');
//   res.write('\r\n');
//   res.write('some data');
//   res.write('\r\n--awesome\r\n');
//   res.write('Content-Disposition: form-data; name="name"\r\n');
//   res.write('Content-Type: text/plain\r\n');
//   res.write('\r\n');
//   res.write('tobi');
//   res.write('\r\n--awesome--');
//   res.end();
// }).listen(4000);

// // request
// // .get('http://localhost:4000')
// // .end(function(res){
// //   console.log(res);
// // })

// var url = require('url');
// var opts = url.parse('http://localhost:4000');
// opts.agent = false;

// http
// .get(opts)
// .on('response', function(res){
//   console.log(res.headers);
//   var form = new formidable.IncomingForm;

//   form.parse(res, function(err, fields, files){
//     if (err) throw err;
//     console.log(fields);
//     console.log(files);
//   });
// })

var url = 'https://raw.github.com/visionmedia/commander.c/master/src/commander.c';

request
.get(url)
.pipe(process.stdout)
// .buffer(false)
// .end(function(err, res){
//   if (err) throw err;
//   console.log(res.header);
//   res.on('data', function(chunk){
//     console.log(chunk.toString());
//   });
// });
