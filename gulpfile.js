/*******************************
             Config
*******************************/

/*
  All config options are defined inside build.config
  Please adjust this to your site's settings
*/

var
  gulp             = require('gulp'),

  // read settings file
  config           = require('./build.json'),

  // formats comments in output
  variableComments = /[\s\S]+\/\* End Config \*\//m,
  largeComment     = /(\/\*\*\*\*[\s\S]+?\*\/)/mg,
  smallComment     = /(\/\*---[\s\S]+?\*\/)/mg,

  // shorthand
  base             = config.base,
  source           = config.paths.source,
  output           = config.paths.output,

  // required node components
  del              = require('del'),
  fs               = require('fs'),

  // required gulp components
  autoprefixer     = require('gulp-autoprefixer'),
  batch            = require('gulp-batch'),
  concat           = require('gulp-concat'),
  copy             = require('gulp-copy'),
  csscomb          = require('gulp-csscomb'),
  karma            = require('gulp-karma'),
  less             = require('gulp-less'),
  notify           = require('gulp-notify'),
  plumber          = require('gulp-plumber'),
  replace          = require('gulp-replace'),
  sourcemaps       = require('gulp-sourcemaps'),
  uglify           = require('gulp-uglify'),
  util             = require('gulp-util'),
  watch            = require('gulp-watch'),

  settings         = {
    prefix: {
      browsers: config.browsers
    }
  }

;

// Add base to all paths
for(var path in source) {
  if(source.hasOwnProperty(path)) {
    source[path] = base + source[path];
  }
}
for(var path in output) {
  if(output.hasOwnProperty(path)) {
    output[path] = base + output[path];
  }
}

/*******************************
            Commands
*******************************/


/*--------------
      User
---------------*/

// Watches for changes to site and recompilesz
gulp.task('default', [
  'watch src'
]);

// Rebuilds all files
gulp.task('build', [
  'build files'
]);

// Rebuilds all files
gulp.task('clean', [
  'clean dist'
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

// cleans distribution files
gulp.task('clean dist', function(callback) {
  del([
    config.output.compressed,
    config.output.minified,
    config.output.packaged
  ], callback);
});


gulp.task('watch src', function () {

  // watch for changes in site

  gulp.watch(source.site + '**/*.{overrides,variables}', function(file) {
    var path;

    // recompile definition
    path = util.replaceExtension(file.path, '.less');
    path = path.replace(source.site, source.definitions);

    if( fs.existsSync(path) ) {
      console.log('Creating file', path);
      return gulp.src(path)
        .pipe(plumber())
        .pipe(less())
        .pipe(autoprefixer(settings.prefix))
        .pipe(replace(variableComments, ''))
        .pipe(replace(largeComment, '\n\n$1\n'))
        .pipe(csscomb())
        .pipe(gulp.dest(output.uncompressed))
      ;
    }
    else {
      console.log('Definition file not found', path);
    }
  });




});


/*--------------
     Library
---------------*/

/* These tasks are designed for updates to the core library */

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

// Build release
gulp.task('build release', function () {

});


/*--------------
     Watch
---------------*/