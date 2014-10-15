/*******************************
             Config
*******************************/

/*
  All config options are defined inside build.config
  Please adjust this to your site's settings
*/

var
  gulp    = require('gulp'),

  // required components
  batch   = require('gulp-batch'),
  concat  = require('gulp-concat'),
  gutil   = require('gulp-util'),
  notify  = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  sass    = require('gulp-less'),
  uglify  = require('gulp-uglify'),
  watch   = require('gulp-watch')

  // read settings file
  config = require('build.config')
;


/*******************************
            Commands
*******************************/

// Watches for changes to site and recompiles
gulp.task('default', [
  'watch site',
  'watch themes'
]);

// Rebuilds all files
gulp.task('default', [
  'build files'
]);

// Rebuilds all files
gulp.task('clean', [
  'clean output'
]);


/*--------------
    Maintainer
---------------*/

gulp.task('watch all', [
  'watch site',
  'watch themes',
  'watch definitions',
  'watch module definitions'
]);

gulp.task('release', [
  'build release'
]);


/*******************************
             Tasks
*******************************/

/*--------------
      User
---------------*/

// recompile from site change
gulp.task('site changed', function(files) {
  console.log('site changed', files);
});

// recompile from packaged theme change
gulp.task('theme changed', function(files) {
  console.log(files);
});

// recompile less from definition change
gulp.task('library definition changed', function(files) {
  console.log(files);

  // compile less

  // prefix css file

  // update concat file


});

// clean output directory
gulp.task('clean output', function(files) {
  console.log(files);

});


/*--------------
    Library
---------------*/

/* These tasks are designed for updates to the core library */

// recompile from library changed
gulp.task('library module changed', function () {
  // console.log("Warning: Edited Library File. I hope you know what you're doing")

});

// Build release
gulp.task('build release', function () {

});


/*--------------
     Watch
---------------*/

gulp.task('watch site', function () {
  watch('src/_site/**/*(.overrides|.variables)', function (files, callback) {
    gulp.start('site files changed', callback);
  });
});

gulp.task('watch themes', function () {
  watch('themes/**/*(.overrides|.variables)', function (files, callback) {
    gulp.start('theme files changed', callback);
  });
});

gulp.task('watch module definition', function () {
  watch('src/definitions/**/*.js', function (files, callback) {
    gulp.start('library module changed', callback);
  });
});

gulp.task('watch definitions', function () {
  watch('src/definitions/**/*.less', function (files, callback) {
    gulp.start('library definition changed', callback);
  });
});