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

  // final config object
  config
;


/*******************************
          User Config
*******************************/

try {
  // looks for config file across all parent directories
  config  = requireDotFile('semantic.json');
}
catch(error) {
  if(error.code === 'MODULE_NOT_FOUND') {
    console.error('No semantic.json config found');
  }
}

if(!config) {
  // No semantic.json file use tasks/config/defaults.js
  config = defaults;
}
else {
  // extend defaults using shallow copy
  config = extend(false, {}, defaults, config);
}


/*******************************
         Derived Values
*******************************/


/*--------------
   File Paths
---------------*/

// resolve source paths
for(var folder in config.paths.source) {
  if(config.paths.source.hasOwnProperty(folder)) {
    config.paths.source[folder] = path.normalize(config.base + config.paths.source[folder]);
  }
}

// resolve output paths
for(folder in config.paths.output) {
  if(config.paths.output.hasOwnProperty(folder)) {
    config.paths.output[folder] = path.normalize(config.base + config.paths.output[folder]);
  }
}

// resolve "clean" command path
config.paths.clean = config.base + config.paths.clean;

/*--------------
    CSS URLs
---------------*/

// determine asset paths in css by finding relative path between themes and output
// force forward slashes

config.paths.assets = {
  source       : '../../themes', // source asset path is always the same
  uncompressed : path.relative(config.paths.output.uncompressed, config.paths.output.themes).replace(/\\/g,'/'),
  compressed   : path.relative(config.paths.output.compressed, config.paths.output.themes).replace(/\\/g,'/'),
  packaged     : path.relative(config.paths.output.packaged, config.paths.output.themes).replace(/\\/g,'/')
};


/*--------------
   Permission
---------------*/

if(config.permission) {
  config.hasPermissions = true;
}
else {
  // pass blank object to avoid causing errors
  config.permission     = {};
  config.hasPermissions = false;
}

/*--------------
     Globs
---------------*/

// takes component object and creates file glob matching selected components
config.globs.components = (typeof config.components == 'object')
  ? (config.components.length > 1)
    ? '{' + config.components.join(',') + '}'
    : config.components[0]
  : '{' + defaults.components.join(',') + '}'
;

/*******************************
             Export
*******************************/

module.exports = config;