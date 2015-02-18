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

  // oAuth configuration for GitHub
  oAuth          = fs.existsSync(__dirname + '/../config/admin/oauth.js')
    ? require('../config/admin/oauth')
    : false,

  package        = requireDotFile('package.json'),
  version        = package.version
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
      gitOptions           = { cwd: outputDirectory },
      quietOptions         = { args: '-q', cwd: outputDirectory },
      localRepoSetup       = fs.existsSync(path.join(outputDirectory, '.git')),

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

      canPush = true
    ;


    console.info('Processing repository:' + outputDirectory);

    function nextRepo() {
      console.log('Sleeping for 1 second...');
      // avoid rate throttling
      global.clearTimeout(timer);
      timer = global.setTimeout(function() {
        stepRepo()
      }, 500);
    }

    // standard path
    function commitFiles() {
      // commit files
      console.info('Committing ' + component + ' files', commitArgs);
      gulp.src('**/*', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(commitMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          console.info('Nothing new to commit');
          nextRepo();
        })
        .on('finish', function(callback) {
          pullFiles();
        })
      ;
    }

    function pullFiles() {
      console.info('Pulling ' + component + ' files');
      git.pull('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          console.error('Cant find remote ref');
          createRepo();
        }
        else {
          console.info('Pull completed successfully');
          mergeCommit();
        }
      });
    }

    function mergeCommit() {
      // commit files
      gulp.src('', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(mergeMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          canPush = false;
        })
        .on('finish', function(callback) {
          if(canPush) {
            console.info('Adding merge commit for ' + component, commitArgs);
            tagFiles();
          }
          else {
            console.info('Nothing new to merge');
          }
        })
      ;
    }

    function tagFiles() {
      console.info('Tagging new version ' + component, version);
      git.tag(version, 'Updated version from semantic-ui (automatic)', function (err) {
        pushFiles();
      });
    }

    function pushFiles() {
      console.info('Pushing files for ' + component);
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          createRepo();
        }
        console.info('Push completed successfully');
        nextRepo();
      });
    }

    // set-up path
    function createRepo() {
      console.info('Creating GitHub repo ' + repoURL);
      github.repos.createFromOrg({
        org      : release.org,
        name     : repoName,
        homepage : release.homepage
      }, function() {
        if(localRepoSetup) {
          addRemote();
        }
        else {
          initRepo();
        }
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
      git.addRemote('origin', gitURL, gitOptions, firstPushFiles);
    }

    function firstPushFiles() {
      console.info('First Push for ' + component);
      git.push('origin', 'master', { args: '-u', cwd: outputDirectory }, function(error) {
        if(error) {
          console.info(error);
          pullFiles();
        }
        else {
          console.info('First push completed successfully');
          nextRepo();
        }
      });
    }

    if(localRepoSetup) {
      commitFiles();
    }
    else {
      createRepo();
    }

  };

  stepRepo();

};
