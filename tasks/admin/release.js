/* Release */
gulp.task('release', false, function() {

  // gulp build
  runSequence(
    'build',
    'create files'
  );

});