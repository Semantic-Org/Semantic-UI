/*******************************
         Release Config
*******************************/

var
  requireDotFile = require('require-dot-file'),
  config,
  package,
  version
;


/*******************************
         Derived Values
*******************************/

try {

  config   = requireDotFile('semantic.json');
  package  = require('../../../package.json');

  // looks for version in config or package.json (whichever is available)
  version = (config && config.version !== undefined)
    ? config.version
    : package.version
  ;

}

catch(error) {
  // generate fake package
  package = {
    version: 'x.x'
  };
}

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

  version    : package.version

};
