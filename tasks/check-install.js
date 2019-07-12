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

  setTimeout(function() {
    if( !install.isSetup() ) {
      console.log('Starting install...');
      gulp.start('install');
      return;
    }
    else {
      gulp.start('watch');
    }
  }, 50); // Delay to allow console.clear to remove messages from check event


};

/* Export with Metadata */
checkInstall.displayName = 'check-install';
checkInstall.description = 'Checks if SUI needs to install before build/watch';
module.exports = checkInstall;
