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
  watch        = require('./tasks/watch'),

  // install tasks
  checkInstall = require('./tasks/check-install'),
  install      = require('./tasks/install'),

  // docs tasks
  serveDocs    = require('./tasks/docs/serve'),
  buildDocs    = require('./tasks/docs/build')
;


/*--------------
      Tasks
---------------*/

gulp.task('watch', 'Watch for site/theme changes', watch);
gulp.task('build', 'Builds all files from source', build);

gulp.task('clean', 'Clean dist folder', clean);
gulp.task('version', 'Displays current version of Semantic', version);

gulp.task('check install', 'Check if project is setup', checkInstall);
gulp.task('install', 'Set-up project for first time', install);

gulp.task('serve-docs', 'Serve file changes to SUI Docs', serveDocs);
gulp.task('build-docs', 'Build all files and add to SUI Docs', buildDocs);

gulp.task('default', false, [
  'check install'
]);


/*--------------
     Admin
---------------*/

if(config.admin) {

}