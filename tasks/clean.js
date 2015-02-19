/*******************************
          Clean Task
*******************************/

var
  del    = require('del'),
  config = require('./config/user'),
  tasks  = require('./config/project/tasks')
;

// cleans distribution files
module.exports = function(callback) {
  return del([config.paths.clean], tasks.settings.del, callback);
};