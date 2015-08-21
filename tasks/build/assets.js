/*******************************
          Build Task
*******************************/

var
  gulp         = require('gulp'),

  // gulp dependencies
  chmod        = require('gulp-chmod'),
  gulpif       = require('gulp-if'),

  // config
  config       = require('../config/user'),
  tasks        = require('../config/tasks'),

  // shorthand
  globs        = config.globs,
  assets       = config.paths.assets,
  output       = config.paths.output,
  source       = config.paths.source,

  log          = tasks.log
;

module.exports = function(callback) {

  console.info('Building assets');

  // copy assets
  return gulp.src(source.themes + '/**/assets/**/*.*')
    .pipe(gulpif(config.hasPermission, chmod(config.permission)))
    .pipe(gulp.dest(output.themes))
  ;

};