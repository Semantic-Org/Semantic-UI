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
  project         = require('../config/project/release'),


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

      gitOptions           = { cwd: outputDirectory, quiet: true },
      quietOptions         = { args: '-q', cwd: outputDirectory, quiet: true },
      checkoutOptions      = { args: '--ours', cwd: outputDirectory },
      pullOptions          = { args: '', cwd: outputDirectory },

      gitURL               = 'https://github.com/' + release.org + '/' + repoName + '.git',
      repoURL              = 'https://github.com/' + release.org + '/' + repoName + '/',

      componentPackage     = fs.existsSync(outputDirectory + 'package.json' )
        ? require(outputDirectory + 'package.json')
        : false,

      isNewVersion  = (version && componentPackage.version != version),
      mergeMessage  = 'Merged from upstream',
      commitMessage = (isNewVersion)
        ? 'Updated component to version ' + version
        : 'Updated component release from Semantic-UI (Automatic)',

      commitArgs = (oAuth.name !== undefined && oAuth.email !== undefined)
        ? '--author "' + oAuth.name + ' <' + oAuth.email + '>"'
        : '',

      localRepoSetup = fs.existsSync(path.join(outputDirectory, '.git')),
      canProceed     = true
    ;


    console.info('Processing repository:' + outputDirectory);

    // standard path
    function commitFiles() {
      // commit files
      console.info('Committing ' + component + ' files', commitArgs);
      gulp.src('**/*', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(commitMessage, { args: commitArgs, cwd: outputDirectory }))
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
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        console.info('Push completed successfully');
        createRelease();
      });
    }

    // create release on GitHub.com
    function createRelease() {
      console.log('Tagging release as ', version);/*
      github.createRelease(releaseOptions, {
        nextRepo();
        tagFiles();
      });*/
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
