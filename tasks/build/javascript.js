/*******************************
          Build Task
*******************************/

const
  gulp         = require('gulp'),

  // node dependencies
  console      = require('better-console'),
  fs           = require('fs'),

  // gulp dependencies
  babel        = require('gulp-babel'),
  chmod        = require('gulp-chmod'),
  flatten      = require('gulp-flatten'),
  gulpif       = require('gulp-if'),
  plumber      = require('gulp-plumber'),
  print        = require('gulp-print'),
  rename       = require('gulp-rename'),
  replace      = require('gulp-replace'),
  sourcemaps   = require('gulp-sourcemaps')
  uglify       = require('gulp-uglify'),

  // config
  config       = require('../config/user'),
  tasks        = require('../config/tasks'),
  install      = require('../config/project/install'),

  // shorthand
  globs        = config.globs,
  assets       = config.paths.assets,
  output       = config.paths.output,
  source       = config.paths.source,

  banner       = tasks.banner,
  comments     = tasks.regExp.comments,
  log          = tasks.log,
  settings     = tasks.settings
;

// add internal tasks (concat release)
require('../collections/internal')(gulp);

module.exports = function(callback) {

  let
    stream,
    compressedStream,
    uncompressedStream
  ;

  console.info('Building Javascript');

  if( !install.isSetup() ) {
    console.error('Cannot build files. Run "gulp install" to set-up Semantic');
    return;
  }

  // copy source javascript
  gulp.src(source.definitions + '/**/' + globs.components + '.js')
    .pipe(plumber())
    .pipe(replace(comments.license.in, comments.license.out))
    .pipe(print(log.created))
    .pipe(sourcemaps.init())
    .pipe(flatten())
    .pipe(gulp.dest(output.uncompressed))
    .pipe(uglify(settings.uglify))
    .pipe(rename(settings.rename.minJS))
    .pipe(sourcemaps.write(config.paths.sourcemaps))
    .pipe(gulp.dest(output.compressed))
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(print(log.created))
    .on('end', function() {
      gulp.start('package compressed js');
      gulp.start('package uncompressed js');
      callback();
    })
  ;

};
