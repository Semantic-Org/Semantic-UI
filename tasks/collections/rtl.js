/*******************************
        Define Sub-Tasks
*******************************/

module.exports = function(gulp) {

  var
    // rtl
    buildRTL     = require('./../rtl/build'),
    watchRTL     = require('./../rtl/watch')
  ;

  gulp.task('watch-rtl', 'Build all files as RTL', watchRTL);
  gulp.task('build-rtl', 'Watch files as RTL ', buildRTL);

};
