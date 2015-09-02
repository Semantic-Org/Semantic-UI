/*******************************
         Release Config
*******************************/

var
  requireDotFile = require('require-dot-file'),
  config,
  packageJSON,
  version
;


/*******************************
         Derived Values
*******************************/

try {
  config      = requireDotFile('semantic.json');
}
catch(error) {}


try {
  packageJSON = require('../../../package.json');
}
catch(error) {
  // generate fake package
  packageJSON = {
    version: 'x.x'
  };
}

// looks for version in config or package.json (whichever is available)
version = (config && config.version !== undefined)
  ? config.version
  : packageJSON.version
;


/*******************************
             Export
*******************************/

module.exports = {

  title      : 'Semantic UI',
  repository : 'https://github.com/Semantic-Org/Semantic-UI',
  url        : 'http://www.semantic-ui.com/',

  banner: ''
    + ' /*' + '\n'
    + ' * # <%= title %> - <%= version %>' + '\n'
    + ' * <%= repository %>' + '\n'
    + ' * <%= url %>' + '\n'
    + ' *' + '\n'
    + ' * Copyright 2014 Contributors' + '\n'
    + ' * Released under the MIT license' + '\n'
    + ' * http://opensource.org/licenses/MIT' + '\n'
    + ' *' + '\n'
    + ' */' + '\n',

  version    : version

};
