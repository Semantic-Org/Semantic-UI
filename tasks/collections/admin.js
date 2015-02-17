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
    // single component releases
    createComponents = require('../admin/create-components'),
    updateComponents = require('../admin/update-components'),

    // one time register with PM
    registerRepos    = require('../admin/register-repos'),

    // meta tasks
    releaseAll       = require('../admin/release-all'),
    release          = require('../admin/release')
  ;

  gulp.task('create components', 'Creates local repos for each component', createComponents);
  gulp.task('update components', 'Commits component updates to GitHub', updateComponents);
  gulp.task('register repos', 'Registers packages with Bower and NPM', registerRepos);
  gulp.task('release all', 'Publishes all releases (components, package)', releaseAll);
  gulp.task('release', 'Publishes only packaged releases', release);

};