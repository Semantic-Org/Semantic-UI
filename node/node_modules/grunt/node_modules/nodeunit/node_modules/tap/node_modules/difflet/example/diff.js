var difflet = require('../');
var a = {
    x : 4,
    z : 8,
    xs : [ 5, 2, 1, { 0 : 'c' } ],
};

var b = {
    x : 4,
    y : 5,
    xs : [ 5, 2, 2, { c : 5 } ],
};

var s = difflet({ comment : true, indent : 2 }).compare(a, b);
console.log(s);
