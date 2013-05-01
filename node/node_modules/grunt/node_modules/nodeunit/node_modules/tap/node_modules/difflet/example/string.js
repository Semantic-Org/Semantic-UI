var difflet = require('../');

var s = difflet.compare({ a : 2, c : 5 }, { a : 3, b : 4 });
process.stdout.write(s);
