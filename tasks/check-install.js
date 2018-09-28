/*******************************
         Check Install
*******************************/

var
  // node dependencies
  gulp        = require('gulp'),
  console     = require('better-console'),
  install     = require('./config/project/install'),
  installTask = require('./install'),
  watch       = require('./watch')
;

// export task
module.exports = function() {

  setTimeout(function() {
    if( !install.isSetup() ) {
      console.log('Starting install...');
      installTask();
      return;
    }
    else {
      watch();
    }
  }, 50); // Delay to allow console.clear to remove messages from check event


};
