/*******************************
          Clean Task
*******************************/

var
  del    = require('del'),
  config = require('./config/user'),
  tasks  = require('./config/tasks'),

  clean
;

// cleans distribution files
clean = function(callback) {
  return del([config.paths.clean], tasks.settings.del, callback);
};

clean.displayName = 'clean';
clean.description = 'Cleans dist folder';
module.exports = clean;
