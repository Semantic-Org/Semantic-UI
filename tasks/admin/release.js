/*******************************
          Release
*******************************/

let
  gulp = require('gulp'),
  {series, parallel} = gulp,

  build               = require('../build'),

  // less/css distributions
  initComponents      = require('./components/init'),
  createComponents    = require('./components/create'),

  // single component releases
  initDistributions   = require('./distributions/init'),
  createDistributions = require('./distributions/create'),

  release
;

/*
 This task update all SUI individual component repos with new versions of components

  * Initializes repositories with current versions
  * Creates local files at ../distributions/ with each repo for release

*/

/* Release All */
release = series(
  build, // build Semantic
  initDistributions, // sync with current github version
  createDistributions, // update each repo with changes from master repo
  initComponents, // sync with current github version
  createComponents // update each repo
);

/* Export with Metadata */
release.displayName = 'release';
release.description = 'Release SUI across all repos';
module.exports = release;
