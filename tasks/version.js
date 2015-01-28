/*******************************
          Version Task
*******************************/

var
  config = require('config')
;

module.exports = function(callback) {
  console.log('Semantic UI ' + config.version);
};