/*******************************
          Update Repos
*******************************/

/*

 This task update all SUI individual component repos with new versions of components

  * Commits changes from create repo
  * Pushes changes to GitHub
  * Tag new releases if version changed in main repo

*/

var
  gulp           = require('gulp'),

  // node dependencies
  console        = require('better-console'),
  fs             = require('fs'),
  path           = require('path'),
  git            = require('gulp-git'),
  githubAPI      = require('github'),
  requireDotFile = require('require-dot-file'),

  // admin files
  github         = require('../config/admin/github.js'),
  release        = require('../config/admin/release'),
  project        = require('../config/project/release'),


  // oAuth configuration for GitHub
  oAuth          = fs.existsSync(__dirname + '/../config/admin/oauth.js')
    ? require('../config/admin/oauth')
    : false,

  // shorthand
  version         = project.version
;

module.exports = function() {

  var
    index = -1,
    total = release.components.length,
    timer,
    stream,
    stepRepo
  ;

  if(!oAuth) {
    console.error('Must add oauth token for GitHub in tasks/config/admin/oauth.js');
    return;
  }

  // Do Git commands synchronously per component, to avoid issues
  stepRepo = function() {

    index = index + 1;
    if(index >= total) {
      return;
    }

    var
      component            = release.components[index]
      outputDirectory      = path.resolve(release.outputRoot + component),
      capitalizedComponent = component.charAt(0).toUpperCase() + component.slice(1),
      repoName             = release.repoRoot + capitalizedComponent,

      gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
      repoURL              = 'https://github.com/' + release.org + '/' + repoName + '/',

      commitArgs = (oAuth.name !== undefined && oAuth.email !== undefined)
        ? '--author "' + oAuth.name + ' <' + oAuth.email + '>"'
        : '',

      componentPackage = fs.existsSync(outputDirectory + 'package.json' )
        ? require(outputDirectory + 'package.json')
        : false,

      isNewVersion  = (version && componentPackage.version != version),

      commitMessage = (isNewVersion)
        ? 'Updated component to version ' + version
        : 'Updated automatically main repository',

      gitOptions      = { cwd: outputDirectory },
      commitOptions   = { args: commitArgs, cwd: outputDirectory },
      releaseOptions  = { tag_name: version, owner: release.org, repo: repoName },
      usernameOptions = { args : 'config  user.name "' + oAuth.name + '"', cwd: outputDirectory },
      emailOptions    = { args : 'config  user.email "' + oAuth.email + '"', cwd: outputDirectory },

      localRepoSetup  = fs.existsSync(path.join(outputDirectory, '.git')),
      canProceed      = true
    ;


    console.info('Processing repository:' + outputDirectory);

    function setUser() {
      git.exec(usernameOptions, function () {
        git.exec(emailOptions, function () {
          commitFiles();
        });
      });
    }

    // standard path
    function commitFiles() {
      // commit files
      console.info('Committing ' + component + ' files', commitArgs);
      gulp.src('**/*', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(commitMessage, commitOptions))
        .on('error', function(error) {
          // canProceed = false; bug in git commit <https://github.com/stevelacy/gulp-git/issues/49>
        })
        .on('finish', function(callback) {
          if(canProceed) {
            pushFiles();
          }
          else {
            console.info('Nothing new to commit');
            nextRepo();
          }
        })
      ;
    }

    // push changess to remote
    function pushFiles() {
      console.info('Pushing files for ' + component);
      git.push('origin', 'master', { args: '-f', cwd: outputDirectory }, function(error) {
        console.info('Push completed successfully');
        createRelease();
      });
    }

    // create release on GitHub.com
    function createRelease() {
      console.log('Tagging release as ', version);
      github.releases.createRelease(releaseOptions, function() {
        nextRepo();
        tagFiles();
      });
      tagFiles();
    }

    // Tags files locally
    function tagFiles() {
      console.info('Tagging new version ' + component, version);
      git.tag(version, 'Updated version from semantic-ui (automatic)', function (err) {
        nextRepo();
      });
    }

    // Steps to next repository
    function nextRepo() {
      console.log('Sleeping for 1 second...');
      // avoid rate throttling
      global.clearTimeout(timer);
      return stepRepo()
    }


    if(localRepoSetup) {
      commitFiles();
    }
    else {
      console.error('Repository must be setup before running update components');
    }

  };

  stepRepo();

};
