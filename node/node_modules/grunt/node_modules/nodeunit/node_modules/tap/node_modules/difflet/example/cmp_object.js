var difflet = require('../');
var s = difflet({ indent : 2, comment : true }).compare(
    { z : [6,7], a : 'abcdefgh', b : [ 31, 'xxt' ] },
    { x : 5, a : 'abdcefg', b : [ 51, 'xxs' ] }
);
console.log(s);
