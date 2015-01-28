/*******************************
          Clean Task
*******************************/

var
  config = require('config'),
  del    = require('del')
;

// cleans distribution files
module.exports = function(callback) {
  return del([config.clean], settings.del, callback);
};