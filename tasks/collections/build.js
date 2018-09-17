/*******************************
        Define Sub-Tasks
*******************************/

module.exports = function(gulp) {

  var
    // build sub-tasks
    buildJS      = require('../build/javascript'),
    buildCSS     = require('../build/css'),
    buildAssets  = require('../build/assets')
  ;

  // in case these tasks are undefined during import, less make sure these are available in scope
  gulp.task('build-javascript', function(done) {
    buildJS();
    done();
  });
  gulp.task('build-css', function(done) {
    buildCSS();
    done();
  });
  gulp.task('build-assets', function(done) {
    buildAssets();
    done();
  });

};
