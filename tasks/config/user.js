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

  // final config object
  userConfig
;

console.log('start config' , defaults);

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
  console.log('start defaults' , defaults);
  userConfig = defaults;
  console.log('end defaults' , defaults);
}
else {
  // extend defaults using shallow copy
  console.log('start extend' , defaults);
  userConfig = extend(false, {}, defaults, userConfig);
  console.log('end extend' , defaults);
}


/*******************************
       Add Derived Values
*******************************/

// adds additional derived values to config
console.log('start derived' , defaults);
userConfig = config.addDerivedValues(userConfig);
console.log('end derived' , defaults);


/*******************************
             Export
*******************************/

module.exports = userConfig;

console.log('end config' , defaults);
