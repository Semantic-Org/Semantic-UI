var detect = require('../');
var fs = require('fs');
var src = fs.readFileSync(__dirname + '/src.js');

var scope = detect(src);
console.dir(scope);
