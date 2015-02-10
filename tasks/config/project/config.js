/*******************************
            Set-up
*******************************/

var
  defaults = require('../defaults'),
  path     = require('path')
;


/*******************************
            Exports
*******************************/


module.exports = {

  // adds additional derived values to a config object
  addDerivedValues: function(config) {

    config = config || defaults;

    /*--------------
       File Paths
    ---------------*/

    var
      currentPath = process.cwd(),
      folder
    ;

    // resolve source paths
    for(folder in config.paths.source) {
      if(config.paths.source.hasOwnProperty(folder)) {
        // add base path
        config.paths.source[folder] = path.join(config.base, config.paths.source[folder]);
        // resolve relative path from cwd to output folder
        config.paths.source[folder] = path.resolve( path.relative(currentPath, config.paths.source[folder])) + path.sep;
      }
    }

    // resolve output paths
    for(folder in config.paths.output) {
      if(config.paths.output.hasOwnProperty(folder)) {
        // add base path
        config.paths.output[folder] = path.join(config.base, config.paths.output[folder]);
        // resolve relative path from cwd to output folder
        config.paths.output[folder] = path.resolve( path.relative(currentPath, config.paths.output[folder])) + path.sep;
      }
    }

    // remove trailing slash from file
    config.paths.source.config = path.resolve(config.paths.source.config);

    // resolve "clean" command path
    config.paths.clean = path.join(config.base, config.paths.clean);

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

    if(!config.globs) {
      config.globs = {};
    }

    // takes component object and creates file glob matching selected components
    config.globs.components = (typeof config.components == 'object')
      ? (config.components.length > 1)
        ? '{' + config.components.join(',') + '}'
        : config.components[0]
      : '{' + defaults.components.join(',') + '}'
    ;

    return config;

  }

};