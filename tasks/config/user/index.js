var

  // npm deps
  extend          = require('extend'),
  fs              = require('fs'),
  path            = require('path'),
  requireDotFile  = require('require-dot-file'),

  defaults        = require('./defaults'),

  // holds package.json contents
  package,
  config

;


/*******************************
          User Config
*******************************/

try {
  // looks for config file across all parent directories
  config  = requireDotFile('semantic.json');
  package = requireDotFile('package.json');
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
    Version
---------------*/

// npm package.json is only location that holds true "version"
config.version = (package !== undefined)
  ? package.version || 'Unknown'
  : 'Unknown'
;

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
  source       : '/../../themes', // source asset path is always the same
  uncompressed : path.relative(config.paths.output.uncompressed, config.paths.output.themes).replace(/\\/g,'/'),
  compressed   : path.relative(config.paths.output.compressed, config.paths.output.themes).replace(/\\/g,'/'),
  packaged     : path.relative(config.paths.output.packaged, config.paths.output.themes).replace(/\\/g,'/')
};


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