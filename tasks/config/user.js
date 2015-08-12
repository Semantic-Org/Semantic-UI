/*******************************
             Set-up
*******************************/

var
  // npm dependencies
  extend          = require('extend'),
  fs              = require('fs'),
  path            = require('path'),
  requireDotFile  = require('require-dot-file'),
  console         = require('better-console'),

  // semantic.json defaults
  defaults        = require('./defaults'),
  config          = require('./project/config'),

  // Final config object
  gulpConfig = {},

  // semantic.json settings
  userConfig

;


/*******************************
          User Config
*******************************/

try {
  // looks for config file across all parent directories
  userConfig = requireDotFile('semantic.json');

  // detect legacy semantic.json file and output deprication notice
  var isLegacy = false;
  if(typeof userConfig.paths.output.packaged == "string"){
      userConfig.paths.output.packaged = {
          "css" : userConfig.paths.output.packaged,
          "js"  : userConfig.paths.output.packaged
      };
      isLegacy = true;
  }
  if(typeof userConfig.paths.output.compressed == "string"){
      userConfig.paths.output.compressed = {
          "css" : userConfig.paths.output.compressed,
          "js"  : userConfig.paths.output.compressed
      };
      isLegacy = true;
  }
  if(typeof userConfig.paths.output.uncompressed == "string"){
      userConfig.paths.output.uncompressed = {
          "css" : userConfig.paths.output.uncompressed,
          "js"  : userConfig.paths.output.uncompressed
      };
      isLegacy = true;
  }
  if(isLegacy){
      console.warn("You are using a legacy version of semantic.json.  Use 'gulp install' to update.");
  }
}
catch(error) {
  if(error.code === 'MODULE_NOT_FOUND') {
    console.error('No semantic.json config found');
  }
}

// extend user config with defaults
gulpConfig = (!userConfig)
  ? extend(true, {}, defaults)
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
