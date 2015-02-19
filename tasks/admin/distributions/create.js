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
        distLowerCase   = distribution.toLowerCase(),
        outputDirectory = path.join(release.outputRoot, distLowerCase),
        packageFile     = path.join(outputDirectory, release.files.npm),
        repoName        = release.distRepoRoot + distribution,
        regExp          = {
          match : {
            version : '{version}'
          }
        },
        task = {
          all     : distribution + ' copying files',
          repo    : distribution + ' create repo',
          meteor  : distribution + ' create meteor package.js',
          package : distribution + ' create package.json'
        }
      ;


      gulp.task(task.meteor, function() {
        gulp.src(release.templates.meteor[distLowerCase])
          .pipe(plumber())
          .pipe(debug())
          .pipe(flatten())
          .pipe(replace(regExp.match.version, version))
          .pipe(rename(release.files.meteor))
          .pipe(gulp.dest(outputDirectory))
        ;
      });

      if(distribution == 'CSS') {
        gulp.task(task.repo, function() {
          return gulp.src('./dist/themes/default/**/*', { base: './dist/' })
            .pipe(gulp.src('./dist/components/*', { base: './dist/' }))
            .pipe(gulp.src('./dist/*', { base: './dist/' }))
            .pipe(plumber())
            .pipe(gulp.dest(outputDirectory))
          ;
        });
      }
      else if(distribution == 'LESS') {
        gulp.task(task.repo, function() {
          return gulp.src('./src/theme.config.example', { base: './src/' })
            .pipe(gulp.src('./src/definitions/**/*', { base: './src/' }))
            .pipe(gulp.src('./src/_site/**/*', { base: './src/' }))
            .pipe(gulp.src('./src/themes/**/*', { base: './src/' }))
            .pipe(plumber())
            .pipe(gulp.dest(outputDirectory))
          ;
        });
      }

      // extend package.json
      gulp.task(task.package, function() {
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

      tasks.push(task.meteor);
      tasks.push(task.repo);
      tasks.push(task.package);

    })(distribution);
  }
  runSequence(tasks, callback);
};