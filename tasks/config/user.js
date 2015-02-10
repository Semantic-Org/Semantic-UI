/*******************************
             Set-up
*******************************/

var
  // npm dependencies
  extend          = require('extend'),
  fs              = require('fs'),
  path            = require('path'),
  requireDotFile  = require('require-dot-file'),

  // semantic.json defaults
  defaults        = require('./defaults'),
  config          = require('./project/config'),

  // final config object
  userConfig
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

if(!userConfig) {
  // No semantic.json file use tasks/config/defaults.js
  console.error('Using default values for gulp');
  userConfig = defaults;
}
else {
  // extend defaults using shallow copy
  userConfig = extend(false, {}, defaults, userConfig);
}


/*******************************
       Add Derived Values
*******************************/

// adds additional derived values to config
userConfig = config.addDerivedValues(userConfig);


/*******************************
             Export
*******************************/

module.exports = userConfig;