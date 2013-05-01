var Hash = require('hashish');

Hash({ a : 1, b : 2, c : 3, d : 4 })
    .map(function (x) { return x * 10 })
    .filter(function (x) { return x < 30 })
    .forEach(function (x, key) {
        console.log(key + ' => ' + x);
    })
;
