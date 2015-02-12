/*******************************
            Set-up
*******************************/

var
  defaults = require('../defaults'),
  fs       = require('fs'),
  path     = require('path')
;


/*******************************
            Exports
*******************************/


module.exports = {

  getPath: function(file, directory) {
    var
      configPath = '',
      walk = function(directory) {
        var
          currentPath = path.normalize( path.join(directory, file) )
        ;
        if( fs.existsSync(currentPath) ) {
          // found file
          configPath = path.normalize(directory);
          return true;
        }
        else {
          // reached file system root, let's stop
          if(path.resolve(directory) == path.sep) {
            return false;
          }
          // otherwise recurse
          walk(directory + '..' + path.sep, file);
        }
      }
    ;

    file      = file      || defaults.files.config;
    directory = directory || __dirname + '/..';

    walk(directory);

    return configPath;

  },

  // adds additional derived values to a config object
  addDerivedValues: function(config) {

    config = config || defaults;

    /*--------------
       File Paths
    ---------------*/

    var
      configPath = this.getPath(),
      folder
    ;

    // resolve source paths
    for(folder in config.paths.source) {
      if(config.paths.source.hasOwnProperty(folder)) {
        // full path is (config location + base + path)
        config.paths.source[folder] = path.resolve(path.join(configPath, config.base, config.paths.source[folder]));
      }
    }

    // resolve output paths
    for(folder in config.paths.output) {
      if(config.paths.output.hasOwnProperty(folder)) {
        // full path is (config location + base + path)
        console.log('start extend' , defaults.paths.output[folder]);
        config.paths.output[folder] = path.resolve(path.join(configPath, config.base, config.paths.output[folder]));
        console.log('end extend' , defaults.paths.output[folder]);
      }
    }

    // resolve "clean" command path
    config.paths.clean = path.resolve( path.join(configPath, config.base, config.paths.clean) );

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

