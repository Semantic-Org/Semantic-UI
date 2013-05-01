var express = require('express');
var browserify = require('browserify');

var app = express.createServer();
app.use(express.static(__dirname));
app.use(browserify({
    entry : __dirname + '/main.js',
    watch : true,
}));

app.listen(8081);
console.log('Listening on :8081');
