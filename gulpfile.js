/*******************************
            Set-up
*******************************/

var
  gulp         = require('gulp-help')(require('gulp')),

  // read user config to know what task to load
  config       = require('./tasks/config/user'),

  // watch for file changes and build
  watch        = require('./tasks/watch'),

  // build all files
  build        = require('./tasks/build'),
  buildJS      = require('./tasks/build/javascript'),
  buildCSS     = require('./tasks/build/css'),
  buildAssets  = require('./tasks/build/assets'),

  // utility tasks
  clean        = require('./tasks/clean'),
  version      = require('./tasks/version'),

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

gulp.task('default', function(done) {
  checkInstall();
  done();
});

gulp.task('watch', function(done) {
  watch();
  done();
});

gulp.task('build', function(done) {
  build();
  done();
});
gulp.task('build-javascript', function(done) {
  buildJS();
  done();
});
gulp.task('build-css', function(done) {
  buildCSS();
  done();
});
gulp.task('build-assets', function(done) {
  buildAssets();
  done();
});

gulp.task('clean', function(done) {
  clean();
  done();
});
gulp.task('version', function(done) {
  version();
  done();
});

gulp.task('install', function(done) {
  install();
  done();
});
gulp.task('check-install', function(done) {
  checkInstall();
  done();
});

/*--------------
      Docs
---------------*/

/*
  Lets you serve files to a local documentation instance
  https://github.com/Semantic-Org/Semantic-UI-Docs/
*/

gulp.task('serve-docs', function(done) {
  serveDocs();
  done();
});
gulp.task('build-docs', function(done) {
  buildDocs();
  done();
});


/*--------------
      RTL
---------------*/

if(config.rtl) {
  gulp.task('watch-rtl', function(done) {
    watchRTL();
    done();
  });
  gulp.task('build-rtl', function(done) {
    buildRTL();
    done();
  });
}

/* Admin Tasks */
if(config.admin) {
  require('./tasks/collections/admin')(gulp);
}
