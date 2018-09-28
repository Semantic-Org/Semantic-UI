/*******************************
          Release
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Initializes repositories with current versions
  * Creates local files at ../distributions/ with each repo for release

*/

var
  gulp = require('gulp')
;

/* Release All */
module.exports = function(callback) {

  (gulp.task('release', gulp.series(
    'init distributions',
    'create distributions',
    'init components',
    'create components',
    function(done) {
      callback();
      done();
    }
  )))();

};
