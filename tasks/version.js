/*******************************
          Version Task
*******************************/

let
  release = require('./config/project/release'),
  version
;

version = function(callback) {
  console.log(release.title + ' ' + release.version);
};

/* Export with Metadata */
version.displayName = 'version';
version.description = 'Displays current version of Semantic';
module.exports = version;
