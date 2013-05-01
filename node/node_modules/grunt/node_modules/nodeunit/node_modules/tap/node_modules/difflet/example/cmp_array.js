var difflet = require('../');
var s = difflet({ indent : 2, comment : true }).compare(
    [ 1, [2,3,{a:4}], 3 ],
    [ 1, [[5],6,7], 4 ]
);
process.stdout.write(s);
