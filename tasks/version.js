/*******************************
          Version Task
*******************************/

let
  gulp    = require('gulp'),
  release = require('./config/project/release'),

  {series, parallel} = gulp,
  version
;

version = function(callback) {
  console.log(release.title + ' ' + release.version);
};

/* Export with Metadata */
version.displayName = 'version';
version.description = 'Displays current version of Semantic';
module.exports = series(version);
