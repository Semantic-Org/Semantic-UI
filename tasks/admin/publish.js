/*******************************
          Release All
*******************************/

/*
 This task update all SUI individual component repos with new versions of components

  * Commits changes from create components to GitHub and Tags

*/
let
  gulp = require('gulp'),
  {series, parallel} = gulp,

  updateComponents    = require('../admin/components/update'),
  updateDistributions = require('../admin/distributions/update'),

  publish
;

/* Release All */
publish = series(
  updateDistributions, // commit less/css versions to github
  updateComponents // commit components to github
);

/* Export with Metadata */
publish.displayName = 'publish';
publish.description = 'Publish new versions of SUI across all repos';
module.exports = publish;
