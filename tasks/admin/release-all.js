/*******************************
          Release All
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Initializes repositories with current versions
  * Creates local files at ../components/ with each repo for release
  * Commits changes from create components
  * Registers new versions with NPM Publish

*/

var
  runSequence = require('run-sequence')
;

/* Release All */
module.exports = function() {

  runSequence(
    'build', // build Semantic
    'init components', // sync with current github version
    'create components', // update each repo
    'update components' // commit changes to github
  );

};