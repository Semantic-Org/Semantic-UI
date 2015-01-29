/*******************************
            Set-up
*******************************/

var
  gulp    = require('gulp-help')(require('gulp')),
  config  = require('./tasks/config/user'),

  // import tasks
  watch   = require('./tasks/watch'),
  build   = require('./tasks/build'),
  clean   = require('./tasks/clean'),
  version = require('./tasks/version')
;

gulp.task('watch', 'Watch for site/theme changes', watch);
gulp.task('build', 'Builds all files from source', build);
gulp.task('clean', 'Clean dist folder', clean);
gulp.task('version', 'Displays current version of Semantic', version);

gulp.task('default', false, [
  'check install'
]);

if(config.admin) {

}