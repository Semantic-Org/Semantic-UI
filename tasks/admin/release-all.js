/*******************************
          Release All
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Creates local files at ../components/ with each repo for release
  * Syncs each component with GitHub

*/

var
  runSequence = require('run-sequence')
;

/* Release All */
module.exports = function() {

  runSequence(
    //'build', // build Semantic
    'init components', // create each component repo
    'create components', // create each component repo
    'update components', // update component repos on github
    'register repos'
  );

};