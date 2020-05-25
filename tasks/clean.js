/*******************************
          Clean Task
*******************************/

var
  gulp   = require('gulp'),

  del    = require('del'),
  config = require('./config/user'),
  tasks  = require('./config/tasks'),

  {series, parallel} = gulp,

  clean
;

// cleans distribution files
clean = function(callback) {
  return del([config.paths.clean], tasks.settings.del, callback);
};

clean.displayName = 'clean';
clean.description = 'Cleans dist folder';
module.exports = series(clean);
