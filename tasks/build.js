/*******************************
          Build Task
*******************************/

let
  // dependencies
  gulp        = require('gulp'),

  // config
  config      = require('./config/user'),
  install     = require('./config/project/install'),

  buildJS     = require('./build/javascript'),
  buildCSS    = require('./build/css'),
  buildAssets = require('./build/assets'),

  // rtl
  buildRTL    = require('./rtl/build'),

  // task sequence
  tasks   = [],

  {series, parallel} = gulp,

  build
;

if(config.rtl == 'both') {
  tasks.push(buildRTL);
}

if(config.rtl === true || config.rtl === 'Yes') {
  tasks.push(buildRTL);
}
else {
  tasks.push(buildJS);
  tasks.push(buildCSS);
  tasks.push(buildAssets);
}

build = parallel(tasks);


/* Export with Metadata */
build.displayName = 'build';
build.description = 'Build SUI from source';
module.exports = build;
