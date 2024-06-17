/*******************************
     Create Distributions
*******************************/

/*
 This will create individual distribution repositories for each SUI distribution

  * copy distribution files to release
  * update package.json file
*/

let
  gulp               = require('gulp'),
  {series, parallel} = gulp,

  mergeStream     = require('merge-stream'),

  // node dependencies
  console         = require('better-console'),
  del             = require('del'),
  fs              = require('fs'),
  path            = require('path'),

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


let
  stream,
  index,
  tasks = []
;

console.log('Creating distributions');
console.log(release.distributions);

for(index in release.distributions) {

  let
    distribution = release.distributions[index]
  ;

  (function(distribution) {
    let
      distLowerCase   = distribution.toLowerCase(),
      outputDirectory = path.join(release.outputRoot, distLowerCase),
      packageFile     = path.join(outputDirectory, release.files.npm),
      repoName        = release.distRepoRoot + distribution,
      regExp          = {
        match : {
          files   : '{files}',
          version : '{version}'
        }
      },
      task = {},
      gatherFiles,
      createList
    ;

    // get files for meteor
    gatherFiles = function(dir) {
      dir = dir || path.resolve('.');

      let
        list  = fs.readdirSync(dir),
        omitted = [
          '.git',
          'node_modules',
          'package.js',
          'LICENSE',
          'README.md',
          'package.json',
          'bower.json',
          '.gitignore'
        ],
        files = []
      ;
      list.forEach(function(file) {
        let
          isOmitted = (omitted.indexOf(file) > -1),
          filePath  = path.join(dir, file),
          stat      = fs.statSync(filePath)
        ;
        if(!isOmitted) {
          if(stat && stat.isDirectory()) {
            files = files.concat(gatherFiles(filePath));
          }
          else {
            files.push(filePath.replace(outputDirectory + path.sep, ''));
          }
        }
      });
      return files;
    };

    // spaces out list correctly
    createList = function(files) {
      let filenames = '';
      for(let file in files) {
        if(file == (files.length - 1) ) {
          filenames += "'" + files[file] + "'";
        }
        else {
          filenames += "'" + files[file] + "',\n    ";
        }
      }
      return filenames;
    };


    let createMeteorRelease = function() {
      console.info('Creating Meteor release');
      let
        files     = gatherFiles(outputDirectory),
        filenames = createList(files)
      ;
      return gulp.src(release.templates.meteor[distLowerCase])
        .pipe(plumber())
        .pipe(flatten())
        .pipe(replace(regExp.match.version, version))
        .pipe(replace(regExp.match.files, filenames))
        .pipe(rename(release.files.meteor))
        .pipe(gulp.dest(outputDirectory))
      ;
    };

    let moveFiles;

    if(distribution == 'CSS') {

      moveFiles = function() {
        let
          themes,
          components,
          releases
        ;
        themes = gulp.src('dist/themes/default/**/*', { base: 'dist/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        components = gulp.src('dist/components/*', { base: 'dist/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        releases = gulp.src('dist/*', { base: 'dist/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        return mergeStream(themes, components, releases);
      };
    }
    else if(distribution == 'LESS') {

      moveFiles = function(callback) {
        let
          definitions,
          themeImport,
          themeConfig,
          siteTheme,
          themes
        ;
        definitions = gulp.src('src/definitions/**/*', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        themeImport = gulp.src('src/semantic.less', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        themeImport = gulp.src('src/theme.less', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        themeConfig = gulp.src('src/theme.config.example', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        siteTheme = gulp.src('src/_site/**/*', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        themes = gulp.src('src/themes/**/*', { base: 'src/' })
          .pipe(gulp.dest(outputDirectory))
        ;
        return mergeStream(definitions, themeImport, themeConfig, siteTheme, themes);
      };
    }

    // extend package.json
    let updatePackageJSON = function() {
      console.info('Updating package.json');
      return gulp.src(packageFile)
        .pipe(plumber())
        .pipe(jsonEditor(function(json) {
          if(version) {
            json.version = version;
          }
          return json;
        }))
        .pipe(gulp.dest(outputDirectory))
      ;
    };

    tasks.push(createMeteorRelease);
    tasks.push(moveFiles);
    tasks.push(updatePackageJSON);

  })(distribution);

}

module.exports = series(tasks);
