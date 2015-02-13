/*******************************
          Register PM
*******************************/

/*
  Task to register component repos with Package Managers
  * Registers component with bower
  * Registers component with NPM
*/

var
  // node dependencies
  process = require('child_process'),

  // config
  release = require('../config/admin/release'),

  total   = release.components.length,
  index   = -1,
  stream,
  stepRepo
;

module.exports = function(callback) {

  console.log('Registering repos with package managers');

  // Do Git commands synchronously per component, to avoid issues
  stepRepo = function() {
    index = index + 1;
    if(index >= total) {
      return;
    }
    var
      component            = release.components[index],
      outputDirectory      = release.outputRoot + component + '/',
      capitalizedComponent = component.charAt(0).toUpperCase() + component.slice(1),
      packageName          = release.packageRoot + component,
      repoName             = release.repoRoot + capitalizedComponent,
      gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
      exec                 = process.exec,
      execSettings         = {cwd: outputDirectory},
      registerBower        = 'bower register ' + packageName + ' ' + gitURL,
      registerNPM          = 'npm publish'

    ;

    /* Register with Bower */
    exec(registerBower, execSettings, function(err, stdout, stderr) {
      stepRepo();
    });

    /* Register with NPM */
    exec(registerNPM, execSettings, function(err, stdout, stderr) {
      console.log(err, stdout, stderr);
      stepRepo();
    });

  };
  stepRepo();
};

