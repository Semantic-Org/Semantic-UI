/*******************************
          Release
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Initializes repositories with current versions
  * Creates local files at ../distributions/ with each repo for release
  * Commits changes from create components
  * Registers new versions with NPM Publish

*/

var
  runSequence = require('run-sequence')
;

/* Release All */
module.exports = function() {

  runSequence(
    //'build', // build Semantic
    'init distributions' // sync with current github version
    //'create distributions', // update each repo with changes from master repo
    //'update distributions' // commit changes to github
  );

};