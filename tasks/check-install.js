/*******************************
         Check Install
*******************************/

var
  // node dependencies
  gulp         = require('gulp'),
  fs           = require('fs'),
  console      = require('better-console'),
  install      = require('./config/project/install'),

  checkInstall
;

// export task
checkInstall = function() {

  if( !install.isSetup() ) {
    console.log('Starting install...');
    gulp.start('install');
    return;
  }
  else {
    gulp.start('watch');
  }

};

/* Export with Metadata */
checkInstall.displayName = 'check-install';
checkInstall.description = 'Checks if SUI needs to install before build/watch';
module.exports = checkInstall;
