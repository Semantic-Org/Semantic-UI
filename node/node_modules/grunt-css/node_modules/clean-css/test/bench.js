var cleanCSS = require('../index'),
  bigcss = require('fs').readFileSync(require('path').join(__dirname, 'data', 'big.css'), 'utf8');

if (!process.hrtime) {
  console.log("process.hrtime() (node > 0.7.6) is required for benchmarking");
  process.exit(1);
}

var start = process.hrtime();
cleanCSS.process(bigcss, { debug: true });

var itTook = process.hrtime(start);
console.log('complete minification: %d ms', 1000 * itTook[0] + itTook[1] / 1000000.0);