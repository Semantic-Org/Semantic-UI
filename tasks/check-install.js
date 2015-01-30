/*******************************
         Check Install
*******************************/

var
  // node dependencies
  gulp         = require('gulp'),
  fs           = require('fs'),
  console      = require('better-console'),

  install      = require('./config/project/install')
;


gulp.task('check install', false, function () {
  if( !install.isSetup() ) {
    console.log('Starting install...');
    gulp.start('install');
    return;
  }
  else {
    gulp.start('watch');
  }
});
