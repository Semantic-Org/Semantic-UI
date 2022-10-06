/*******************************
          Register PM
*******************************/

/*
  Task to register component repos with Package Managers
  * Registers component with bower
  * Registers component with NPM
*/

let
  // node dependencies
  process = require('child_process'),

  npmPublish = require('@jsdevtools/npm-publish'),

  // config
  release = require('../config/admin/release'),

  // register components and distributions
  repos   = release.distributions.concat(release.components),
  total   = repos.length,
  index   = -1,

  stream,
  stepRepo
;

module.exports = function(callback) {

  console.log('Registering repos with package managers');

  // Do Git commands synchronously per component, to avoid issues
  stepRepo = async function() {

    index = index + 1;
    if(index >= total) {
      callback();
      return;
    }

    let
      fs     = require('fs'),
      config = fs.existsSync(__dirname + '/../config/admin/oauth.js')
        ? require('../config/admin/oauth')
        : false,
      repo            = repos[index].toLowerCase(),
      outputDirectory = `${release.outputRoot}${repo}/`,
      exec            = process.exec,
      execSettings    = {cwd: outputDirectory},
      updateNPM       = 'meteor publish;'
    ;

    /* Register with NPM */
    console.info(`NPM Publish "${repo}"`);
    console.info(outputDirectory);
    await npmPublish({
      package: `${outputDirectory}/package.json`,
      token: config.npmToken,
      greaterVersionOnly: true,
      debug: function(log) {
        console.log(log);
      }
    });

    /* Register with NPM */
    console.info(`Meteor publish "${repo}"`);
    console.info(outputDirectory);
    exec(updateNPM, execSettings, function(err, stdout, stderr) {
      console.log(err, stdout, stderr);
      stepRepo();
    });

  };
  stepRepo();
};

