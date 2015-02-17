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
  fs             = require('fs'),
  git            = require('gulp-git'),
  githubAPI      = require('github'),
  requireDotFile = require('require-dot-file'),

  // admin files
  github         = require('../config/admin/github.js'),
  release        = require('../config/admin/release'),

  // oAuth configuration for GitHub
  oAuth          = fs.existsSync('../config/admin/oauth')
    ? require('../config/admin/oauth')
    : false,

  package        = requireDotFile('package.json'),
  version        = package.version
;

module.exports = function() {

  var
    index = -1,
    total = release.components.length,
    stream,
    stepRepo
  ;
  console.log('Handling git');

  if(!oAuth) {
    console.error('Must add oauth token for GitHub in tasks/admin/oauth.js');
    return;
  }

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
      repoName             = release.repoRoot + capitalizedComponent,
      gitOptions           = { cwd: outputDirectory },
      quietOptions         = { args: '-q', cwd: outputDirectory },
      isRepository         = fs.existsSync(outputDirectory + '.git/'),

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
        : ''
    ;

    console.log('Processing repository:' + outputDirectory);

    // standard path
    function commitFiles() {
      // commit files
      console.log('Committing files', commitArgs);
      gulp.src('**/*', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(commitMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          console.log('Nothing new to commit');
          stepRepo();
        })
        .on('finish', function(callback) {
          pullFiles();
        })
      ;
    }

    function pullFiles() {
      console.log('Pulling files');
      git.pull('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") != -1) {
          createRepo();
        }
        else {
          console.log('Pull completed successfully');
          mergeCommit();
        }
      });
    }

    function mergeCommit() {
      // commit files
      console.log('Adding merge commit', commitArgs);
      gulp.src('', gitOptions)
        .pipe(git.add(gitOptions))
        .pipe(git.commit(mergeMessage, { args: commitArgs, cwd: outputDirectory }))
        .on('error', function(error) {
          console.log('Nothing new to merge', error);
        })
        .on('finish', function(callback) {
          tagFiles();
        })
      ;
    }

    function tagFiles() {
      console.log('Tagging new version ', version);
      git.tag(version, 'Updated version from semantic-ui (automatic)', function (err) {
        pushFiles();
      });
    }

    function pushFiles() {
      console.log('Pushing files');
      git.push('origin', 'master', { args: '', cwd: outputDirectory }, function(error) {
        if(error && error.message.search("Couldn't find remote ref") == -1) {
          createRepo();
        }
        console.log('Push completed successfully');
        stepRepo();
      });
    }

    // set-up path
    function createRepo() {
      console.log('Creating repository ' + repoURL);
      github.repos.createFromOrg({
        org      : release.org,
        name     : repoName,
        homepage : release.homepage
      }, function() {
        if(isRepository) {
          addRemote();
        }
        else {
          initRepo();
        }
      });
    }

    function initRepo() {
      console.log('Initializing repository in ' + outputDirectory);
      git.init(gitOptions, function(error) {
        if(error) {
          console.error('Error initializing repo');
          return;
        }
        addRemote();
      });
    }

    function addRemote() {
      console.log('Adding remote origin as ' + gitURL);
      git.addRemote('origin', gitURL, gitOptions, firstPushFiles);
    }

    function firstPushFiles() {
      console.log('Pushing files');
      git.push('origin', 'master', { args: '-u', cwd: outputDirectory }, function(error) {
        if(error) {
          console.log(error);
          pullFiles();
        }
        else {
          console.log('First push completed successfully');
          stepRepo();
        }
      });
    }

    if(isRepository) {
      commitFiles();
    }
    else {
      createRepo();
    }

  };

  return stepRepo();

};
