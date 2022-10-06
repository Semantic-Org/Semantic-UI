/*******************************
        Define Sub-Tasks
*******************************/

module.exports = function(gulp) {

  var
    // rtl
    buildRTL     = require('./../rtl/build'),
    watchRTL     = require('./../rtl/watch')
  ;

  gulp.task('watch-rtl', watchRTL);
  gulp.task('build-rtl', buildRTL);

};
