/*******************************
        Define Sub-Tasks
*******************************/

module.exports = function(gulp) {

  let
    // build sub-tasks
    buildJS      = require('./../build/javascript'),
    buildCSS     = require('./../build/css'),
    buildAssets  = require('./../build/assets')
  ;

  // in case these tasks are undefined during import, lets make sure these are available in scope
  gulp.task('build-javascript', buildJS);
  gulp.task('build-css', buildCSS);
  gulp.task('build-assets', buildAssets);

};
