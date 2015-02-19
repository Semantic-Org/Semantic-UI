/*******************************
     Create Distributions
*******************************/

/*
 This will create individual distribution repositories for each SUI distribution

  * copy distribution files to release
  * update package.json file
*/

var
  gulp            = require('gulp'),

  // node dependencies
  console         = require('better-console'),
  del             = require('del'),
  fs              = require('fs'),
  path            = require('path'),
  runSequence     = require('run-sequence'),

  // admin dependencies
  concatFileNames = require('gulp-concat-filenames'),
  debug           = require('gulp-debug'),
  flatten         = require('gulp-flatten'),
  git             = require('gulp-git'),
  jsonEditor      = require('gulp-json-editor'),
  plumber         = require('gulp-plumber'),
  rename          = require('gulp-rename'),
  replace         = require('gulp-replace'),
  tap             = require('gulp-tap'),

  // config
  config          = require('../../config/user'),
  release         = require('../../config/admin/release'),
  project         = require('../../config/project/release'),

  // shorthand
  version         = project.version,
  output          = config.paths.output

;


module.exports = function(callback) {
  var
    stream,
    index,
    tasks = []
  ;

  for(index in release.distributions) {

    var
      distribution = release.distributions[index]
    ;

    // streams... designed to save time and make coding fun...
    (function(distribution) {

      var
        outputDirectory = release.outputRoot + distribution,
        packageFile     = path.join(outputDirectory, release.files.npm),
        repoName        = release.distRepoRoot + distribution
        task = {
          all     : distribution + ' copying files',
          repo    : distribution + ' create repo',
          package : distribution + ' create package.json'
        }
      ;

      // copy source files depending on distribution type
      gulp.task(task.repo, false, function() {
        if(distribution == 'CSS') {
          return gulp.src('dist/**/*')
            .pipe(plumber())
            .pipe(gulp.dest(outputDirectory))
          ;
        }
        else if(distribution == 'LESS') {
          return gulp.src('src/**/*')
            .pipe(plumber())
            .pipe(gulp.dest(outputDirectory))
          ;
        }
      });

      // extend package.json
      gulp.task(task.package, false, function() {
        return gulp.src(packageFile)
          .pipe(plumber())
          .pipe(jsonEditor(function(package) {
            if(version) {
              package.version = version;
            }
            return package;
          }))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      // synchronous tasks in orchestrator? I think not
      gulp.task(task.all, false, function(callback) {
        runSequence([
          task.repo,
          task.package
        ], callback);
      });

      tasks.push(task.all);

    })(distribution);
  }

  runSequence(tasks, callback);
};