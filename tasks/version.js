/*******************************
          Version Task
*******************************/

var
  config = require('./config/project/release')
;

module.exports = function(callback) {
  console.log(release.title + ' ' + release.version);
};