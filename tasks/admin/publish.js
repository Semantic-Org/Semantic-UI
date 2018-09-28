/*******************************
          Release All
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Commits changes from create components to GitHub and Tags

*/

var
  gulp = require('gulp')
;

/* Release All */
module.exports = function(callback) {

  (gulp.task('publish', gulp.series('update distributions', 'update components', function(done) {
    callback();
    done();
  })))();

};
