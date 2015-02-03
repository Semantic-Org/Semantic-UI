/*******************************
            Set-up
*******************************/

var
  gulp         = require('gulp-help')(require('gulp')),

  // read user config to know what task to load
  config       = require('./tasks/config/user'),

  // import tasks
  build        = require('./tasks/build'),
  clean        = require('./tasks/clean'),
  version      = require('./tasks/version'),
  watch        = require('./tasks/watch')
;


/*--------------
     Public
---------------*/

gulp.task('watch', 'Watch for site/theme changes', watch);
gulp.task('build', 'Builds all files from source', build);

gulp.task('clean', 'Clean dist folder', clean);
gulp.task('version', 'Displays current version of Semantic', version);

gulp.task('default', false, [
  'watch'
]);