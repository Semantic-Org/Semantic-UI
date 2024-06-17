/*******************************
          Update Repos
*******************************/

/*

 This task update all SUI individual distribution repos with new versions of distributions

  * Commits changes from create repo
  * Pushes changes to GitHub
  * Tag new releases if version changed in main repo

*/

let
  gulp           = require('gulp'),

  // node dependencies
  console        = require('better-console'),
  fs             = require('fs'),
  path           = require('path'),
  git            = require('gulp-git'),
  requireDotFile = require('require-dot-file'),

  // admin files
  github         = require('../../config/admin/github.js'),
  release        = require('../../config/admin/release'),
  project        = require('../../config/project/release'),


  // oAuth configuration for GitHub
  oAuth          = fs.existsSync(__dirname + '/../../config/admin/oauth.js')
    ? require('../../config/admin/oauth')
    : false,

  // shorthand
  version = project.version
;

module.exports = function(callback) {

  let
    index = -1,
    total = release.distributions.length,
    timer,
    stream,
    stepRepo
  ;

  if(!oAuth) {
    console.error('Must add oauth token for GitHub in tasks/config/admin/oauth.js');
    return;
  }

  // Do Git commands synchronously per distribution, to avoid issues
  stepRepo = function() {

    index = index + 1;
    if(index >= total) {
      callback();
      return;
    }

    let
      distribution         = release.distributions[index],
      outputDirectory      = path.resolve(path.join(release.outputRoot, distribution.toLowerCase() )),
      repoName             = release.distRepoRoot + distribution,

      commitArgs = (oAuth.name !== undefined && oAuth.email !== undefined)
        ? '--author "' + oAuth.name + ' <' + oAuth.email + '>"'
        : '',

      distributionPackage = fs.existsSync(outputDirectory + 'package.json' )
        ? require(outputDirectory + 'package.json')
        : false,

      isNewVersion  = (version && distributionPackage.version != version),

      commitMessage = (isNewVersion)
        ? 'Updated distribution to version ' + version
        : 'Updated files from main repo',

      gitOptions      = { cwd: outputDirectory },
      commitOptions   = { args: commitArgs, cwd: outputDirectory },
      releaseOptions  = { tag_name: version, owner: release.org, repo: repoName },

      fileModeOptions = { args : 'config core.fileMode false', cwd: outputDirectory },
      usernameOptions = { args : 'config user.name "' + oAuth.name + '"', cwd: outputDirectory },
      emailOptions    = { args : 'config user.email "' + oAuth.email + '"', cwd: outputDirectory },
      versionOptions =  { args : 'rev-parse --verify HEAD', cwd: outputDirectory },

      localRepoSetup  = fs.existsSync(path.join(outputDirectory, '.git')),
      canProceed      = true
    ;


    console.info('Processing repository:' + outputDirectory);

    function setConfig() {
      git.exec(fileModeOptions, function() {
        git.exec(usernameOptions, function () {
          git.exec(emailOptions, function () {
            commitFiles();
          });
        });
      });
    }

    // standard path
    function commitFiles() {
      // commit files
      console.info('Committing ' + distribution + ' files', commitArgs);
      gulp.src('./', gitOptions)
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

    // push changes to remote
    function pushFiles() {
      console.info('Pushing files for ' + distribution);
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        console.info('Push completed successfully');
        getSHA();
      });
    }

    // gets SHA of last commit
    function getSHA() {
      git.exec(versionOptions, function(error, version) {
        version = version.trim();
        try {
          createRelease(version);
        } catch(e) {
          console.error('Failed to create release, most likely this release already exists');
        }
      });
    }

    // create release on GitHub.com
    async function createRelease(version) {
      if(version) {
        releaseOptions.target_commitish = version;
      }
      console.info('-----------------------------');
      console.info(releaseOptions);
      console.info('-----------------------------');
      try {
        await github.repos.createRelease(releaseOptions)
      }
      catch(e) {
        console.error(`Release creation failed. Most likely already released "${releaseOptions.tag_name}"`);
      };
      nextRepo();
    }

    // Steps to next repository
    function nextRepo() {
      console.log('Sleeping for 1 second...');
      // avoid rate throttling
      global.clearTimeout(timer);
      timer = global.setTimeout(function() {
        console.log('Sleeping complete');
        stepRepo();
      }, 100);
    }


    if(localRepoSetup) {
      setConfig();
    }
    else {
      console.error('Repository must be setup before running update distributions');
    }

  };

  stepRepo();

};
