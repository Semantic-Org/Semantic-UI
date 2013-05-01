/*
 * config.js: Configuration information for your Loggly account.
 *            This information is only used for require('loggly')./\.+/ methods
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

//
// function createConfig (defaults) 
//   Creates a new instance of the configuration 
//   object based on default values
//
exports.createConfig = function (defaults) {
  return new Config(defaults);
};

//
// Config (defaults) 
//   Constructor for the Config object
//
var Config = exports.Config = function (defaults) {
  if (!defaults.subdomain) {
    throw new Error('Subdomain is required to create an instance of Config');
  }
  
  this.subdomain = defaults.subdomain;
  this.json = defaults.json || null;
  this.auth = defaults.auth || null;
};
 
Config.prototype = {
  get subdomain () {
   return this._subdomain; 
  },

  set subdomain (value) {
    this._subdomain = value;
  },
  
  get logglyUrl () {
    return 'https://' + [this._subdomain, 'loggly', 'com'].join('.') + '/api';
  },
  
  get inputUrl () {
    return 'https://logs.loggly.com/inputs/';
  }
};
