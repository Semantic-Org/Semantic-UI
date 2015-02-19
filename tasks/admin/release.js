/*******************************
           Release
*******************************/

/*
 This task update only SUI repos that use the full release (all components)

*/

var
  runSequence = require('run-sequence')
;

module.exports = function() {

  runSequence(
    'build', // build semantic
    'create static repo' // create standalone css repo
  );

};