var Hash = require('hashish');
var obj = { a : 1, b : 2, c : 3, d : 4 };

var mapped = Hash.map(obj, function (x) {
    return x * 10
});
console.dir(mapped);
