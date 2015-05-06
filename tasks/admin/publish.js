/*******************************
          Release All
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Commits changes from create components to GitHub and Tags

*/

var
  runSequence = require('run-sequence')
;

/* Release All */
module.exports = function(callback) {

  runSequence(
    'update distributions', // commit less/css versions to github
    'update components', // commit components to github
    callback
  );

};