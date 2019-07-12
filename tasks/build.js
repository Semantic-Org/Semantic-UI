/*******************************
          Build Task
*******************************/

var
  // dependencies
  gulp    = require('gulp'),

  // config
  config  = require('./config/user'),
  install = require('./config/project/install'),

  // task sequence
  tasks   = [],

  {series, parallel} = gulp,

  build
;


build = function(callback) {

  console.info('Building Semantic');

  if( !install.isSetup() ) {
    console.error('Cannot find semantic.json. Run "gulp install" to set-up Semantic');
    return 1;
  }

  // check for right-to-left (RTL) language
  if(config.rtl === true || config.rtl === 'Yes') {
    gulp.start('build-rtl');
    return;
  }

  if(config.rtl == 'both') {
    tasks.push('build-rtl');
  }

  tasks.push('build-javascript');
  tasks.push('build-css');
  tasks.push('build-assets');

  tasks = tasks.map(task => {
    gulp.task(task)(callback);
    return (taskDone) => {
      taskDone();
    };
  });

  series(parallel(tasks), callback);
};


/* Export with Metadata */
build.displayName = 'build';
build.description = 'Build SUI from source';
module.exports = build;
