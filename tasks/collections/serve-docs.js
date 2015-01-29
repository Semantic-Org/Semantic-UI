
/* Moves watched files to static site generator output */
gulp.task('serve-docs', false, function () {
  config = require('./tasks/admin/docs.json');
  getConfigValues();

  // copy source files
  gulp
    .watch([
      'src/**/*.*'
    ], function(file) {
      console.clear();
      return gulp.src(file.path, { base: 'src/' })
        .pipe(chmod(config.permission))
        .pipe(gulp.dest(output.less))
        .pipe(print(log.created))
      ;
    })
  ;
  gulp.start('watch');
});
