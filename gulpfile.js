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
  install      = require('./tasks/install'),
  checkInstall = require('./tasks/check-install'),

  // docs tasks
  serveDocs    = require('./tasks/docs/serve'),
  buildDocs    = require('./tasks/docs/build'),

  // rtl
  buildRTL     = require('./tasks/rtl/build'),
  watchRTL     = require('./tasks/rtl/watch')
;


/*******************************
             Tasks
*******************************/

gulp.task('default', false, [
  'check-install'
]);

gulp.task('watch', 'Watch for site/theme changes', watch);
gulp.task('build', 'Builds all files from source', build);

gulp.task('clean', 'Clean dist folder', clean);
gulp.task('version', 'Displays current version of Semantic', version);

gulp.task('install', 'Runs set-up', install);
gulp.task('check-install', 'Displays current version of Semantic', checkInstall);

/*--------------
      Docs
---------------*/

/*
  Lets you serve files to a local documentation instance
  https://github.com/Semantic-Org/Semantic-UI-Docs/
*/

gulp.task('serve-docs', 'Serve file changes to SUI Docs', serveDocs);
gulp.task('build-docs', 'Build all files and add to SUI Docs', buildDocs);


/*--------------
      RTL
---------------*/

if(config.rtl) {
  gulp.task('watch-rtl', 'Build all files as RTL', watchRTL);
  gulp.task('build-rtl', 'Watch files as RTL ', buildRTL);
}

/* Admin Tasks */
if(config.admin) {
  require('./tasks/collections/admin')(gulp);
}