/*
  All configurable options are defined in separate files inside the 'task/' folder
  Please adjust these files according to your personal requirements
*/

/*******************************
            Set-up
*******************************/


var
  gulp            = require('gulp-help')(require('gulp')),

  // node components & oddballs
  console         = require('better-console'),
  extend          = require('extend'),
  fs              = require('fs'),

  // config
  config = require('./tasks/config/'),

  // tasks
  build   = require('./tasks/build')
  // watch   = require('./tasks/watch'),
  // clean   = require('./tasks/clean'),
  //version = require('./tasks/version')

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

gulp.task('build', 'Builds all files from source', build);
//gulp.task('watch', 'Watch for site/theme changes (Default Task)', watch);
//gulp.task('clean', 'Clean dist folder', clean);
//gulp.task('version', 'Displays current version of Semantic', version);
