/*******************************
             Set-up
*******************************/

var
  // npm dependencies
  extend          = require('node.extend'),
  fs              = require('fs'),
  path            = require('path'),
  requireDotFile  = require('require-dot-file'),

  // semantic.json defaults
  defaults        = require('./defaults'),
  config          = require('./project/config'),

  // semantic.json settings
  userConfig,

  // final config object
  gulpConfig
;


/*******************************
          User Config
*******************************/

try {
  // looks for config file across all parent directories
  userConfig = requireDotFile('semantic.json');
}
catch(error) {
  if(error.code === 'MODULE_NOT_FOUND') {
    console.error('No semantic.json config found');
  }
}

// extend user config with defaults
gulpConfig = (!userConfig)
  ? extend(false, {}, defaults)
  : extend(false, {}, defaults, userConfig)
;

/*******************************
       Add Derived Values
*******************************/

// adds calculated values
config.addDerivedValues(gulpConfig);


/*******************************
             Export
*******************************/

module.exports = gulpConfig;

