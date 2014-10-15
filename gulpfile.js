var
  gulp   = require('gulp'),
  concat = require('gulp-concat'),
  gutil  = require('gulp-util'),
  notify = require('gulp-notify'),
  sass   = require('gulp-less'),
  uglify = require('gulp-uglify'),
  watch  = require('gulp-watch'),

  // read settings file
  config = require('build.config')
;

// update watched less file
gulp.task('less', function () {
  gulp.src('./src/**/*.less')
    .pipe(less({
      noCache: true,
      style: "expanded",
      lineNumbers: true,
      loadPath: './assets/styles/*'
    }))
    .pipe(gulp.dest('./assets/styles'))
    .pipe(notify({
      message: "You just got super Sassy!"
    }));;
});

// uglify task
gulp.task('js', function() {
  // main app js file
  gulp.src('./assets/js/app.js')
  .pipe(uglify())
  .pipe(concat("app.min.js"))
  .pipe(gulp.dest('./assets/js/'));

  // create 1 vendor.js file from all vendor plugin code
  gulp.src('./assets/js/vendor/**/*.js')
  .pipe(uglify())
  .pipe(concat("vendor.js"))
  .pipe(gulp.dest('./assets/js'))
  .pipe( notify({ message: "Javascript is now ugly!"}) );
});

gulp.task('watch', function() {
  // watch scss files
  gulp.watch('./assets/styles/**/*.scss', function() {
    gulp.run('sass');
  });

  gulp.watch('./assets/js/**/*.js', function() {
    gulp.run('js');
  });
});

gulp.task('default', ['watch']);
gulp.task('build', ['watch']);