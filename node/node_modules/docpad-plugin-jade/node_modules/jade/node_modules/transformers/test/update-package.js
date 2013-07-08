var transformers = require('../');
var pack = require('../package');
Object.keys(transformers)
  .forEach(function (transformer) {
    transformers[transformer].engines
      .forEach(function (engine) {
        if (engine != '.' && !pack.devDependencies[engine]) {
          pack.devDependencies[engine] = '*';
        }
      });
  });
require('fs').writeFileSync(require('path').join(__dirname, '..', 'package.json'),
  JSON.stringify(pack, null, 2));