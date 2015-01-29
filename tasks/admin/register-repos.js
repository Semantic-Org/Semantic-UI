gulp.task('register repos', false, function(callback) {
  var
    index = -1,
    total = release.components.length,
    process = require('child_process'),
    stream,
    stepRepo
  ;
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
    /* One time register
    exec(registerBower, execSettings, function(err, stdout, stderr) {
      stepRepo();
    });
    */
    /* Update npm
    exec(registerNPM, execSettings, function(err, stdout, stderr) {
      console.log(err, stdout, stderr);
      stepRepo();
    });
    */
  };
  stepRepo();
});

