/*******************************
     Admin Task Collection
*******************************/

/*
  This are tasks to be run by project maintainers
  - Creating Component Repos
  - Syncing with GitHub via APIs
  - Modifying package files
*/

/*******************************
             Tasks
*******************************/


module.exports = function(gulp) {
  var
    // less/css distributions
    initComponents      = require('../admin/components/init'),
    createComponents    = require('../admin/components/create'),
    updateComponents    = require('../admin/components/update'),

    // single component releases
    initDistributions   = require('../admin/distributions/init'),
    createDistributions = require('../admin/distributions/create'),
    updateDistributions = require('../admin/distributions/update'),

    // one time register with PM
    registerRepos       = require('../admin/register-repos'),

    // meta tasks
    releaseAll          = require('../admin/release-all'),
    release             = require('../admin/release')
  ;

  gulp.task('release', 'Publishes only packaged releases', release);
  gulp.task('release all', 'Publishes all releases (components, package)', releaseAll);

  gulp.task('init distributions', 'Grabs each component from GitHub', initDistributions);
  gulp.task('create distributions', 'Updates files in each repo', createDistributions);
  gulp.task('update distributions', 'Commits component updates from create to GitHub', updateDistributions);

  gulp.task('init components', 'Grabs each component from GitHub', initComponents);
  gulp.task('create components', 'Updates files in each repo', createComponents);
  gulp.task('update components', 'Commits component updates from create to GitHub', updateComponents);

  gulp.task('register repos', 'Registers all packages with NPM', registerRepos);

};