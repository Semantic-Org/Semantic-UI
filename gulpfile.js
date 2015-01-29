/*******************************
            Set-up
*******************************/

var
  gulp   = require('gulp-help')(require('gulp')),

  config = require('./tasks/config/user')
;


/*******************************
             Tasks
*******************************/

/*
  All tasks are defined in sub-folder "tasks/"
*/

gulp.task('default', false, [
  'check install'
]);

gulp.task('watch', 'Watch for site/theme changes', require('./tasks/watch'));
gulp.task('build', 'Builds all files from source', require('./tasks/build'));

gulp.task('clean', 'Clean dist folder', require('./tasks/clean'));
gulp.task('version', 'Displays current version of Semantic', require('./tasks/version'));

if(config.admin) {

}