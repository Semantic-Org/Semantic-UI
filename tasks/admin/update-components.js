/*******************************
          Update Repos
*******************************/

/*

 This task update all SUI individual component repos with new versions of components

  * Creates new repo if doesnt exist (locally & GitHub)
  * Adds remote it doesnt exists
  * Commits changes
  * Pulls latest changes from repo
  * Merges changes if necessary
  * Tag new releases if version changed in main repo
  * Pushes changes to GitHub

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

    function nextRepo() {
      console.log('Sleeping for 1 second...');
      // avoid rate throttling
      global.clearTimeout(timer);
      timer = global.setTimeout(function() {
        stepRepo()
      }, 1500);
    }

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
            pullFiles();
          }
          else {
            console.info('Nothing new to commit');
            nextRepo();
          }
        })
      ;
    }

    function pullFiles() {
      console.info('Pulling ' + component + ' files');
      git.pull('origin', 'master', pullOptions, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          console.error('Cant find remote ref');
          setupRepo();
        }
        else {
          checkoutOurs();
        }
      });
    }

    function checkoutOurs() {
      gulp.src('**/*', gitOptions)
        .pipe(git.checkoutFiles(checkoutOptions))
        .on('error', function(error) {
          canProceed = false;
        })
        .on('finish', function(callback) {
          if(canProceed) {
            mergeCommit();
          }
          else {
            console.log(checkoutOptions);
            console.error('Error checking out "ours"');
          }
        })
      ;
    }

    // commit files
    function mergeCommit() {
      gulp.src('', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(mergeMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          canProceed = false;
        })
        .on('finish', function(callback) {
          if(canProceed) {
            console.info('Updating ' + component, commitArgs);
            tagFiles();
          }
          else {
            console.info('Nothing new to commit');
            stepRepo();
          }
        })
      ;
    }

    // tag files
    function tagFiles() {
      console.info('Tagging new version ' + component, version);
      git.tag(version, 'Updated version from semantic-ui (automatic)', function (err) {
        pushFiles();
      });
    }

    // push changess to remote
    function pushFiles() {
      console.info('Pushing files for ' + component);
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          setupRepo();
        }
        console.info('Push completed successfully');
        createRelease();
        nextRepo();
      });
    }

    function createRelease() {
      console.log('Tagging release as ', version);/*
      github.createRelease(releaseOptions, {
        nextRepo();
      });*/
      nextRepo();
    }

    // set-up local repo
    function setupRepo() {
      if(localRepoSetup) {
        addRemote();
      }
      else {
        initRepo();
      }
    }

    // set-up path
    function createRepo() {
      console.info('Creating GitHub repo ' + repoURL);
      github.repos.createFromOrg({
        org      : release.org,
        name     : repoName,
        homepage : release.homepage
      }, function() {
        setupRepo();
      });
    }

    function initRepo() {
      console.info('Initializing repository for ' + component);
      git.init(gitOptions, function(error) {
        if(error) {
          console.error('Error initializing repo');
          return;
        }
        addRemote();
      });
    }

    function addRemote() {
      console.info('Adding remote origin as ' + gitURL);
      git.addRemote('origin', gitURL, gitOptions, function(){
        commitFiles();
      });
    }

    if(localRepoSetup) {
      commitFiles();
    }
    else {
      setupRepo();
      // createRepo() only use to create remote repo (easier to do manually)
    }

  };

  return stepRepo();

};
