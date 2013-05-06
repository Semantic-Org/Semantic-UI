
var fs = require('fs');
var Server = require('..').Server;

// Basic grunt facade to tiny-lr server.
//
// XXX: Consider
//
// - spawning the server in the background.
// - changing the reload target to use HTTP requests to notify the server.
// - providing a `tinylr-stop` task.
//
// Examples
//
//      grunt tinylr-start &
//      grunt tinylr-reload:path/to/asset.ext[,...]
//

module.exports = function(grunt) {
  var util = grunt.util || grunt.utils;
  var _ = util._;

  // server instance
  var server;

  // Task to start up a new tiny-lr Server, with the provided port.
  //
  // - options - Hash of options in Gruntfile `tiny-lr` prop with the following
  //             properties
  //             :port - The port to listen on (defaults: 35729)
  //
  grunt.registerTask('tinylr-start', 'Start the tiny livereload server', function() {
    var options = _.defaults(grunt.config('tiny-lr') || {}, {
      port: 35729
    });

    // if grunt 0.3, build up the list of mtimes to compare
    changed();

    var done = this.async();
    server = new Server();
    grunt.log.writeln('... Starting server on ' + options.port + ' ...');
    server.listen(options.port, this.async());
  });

  // Task to send a reload notification to the previously started server.
  //
  // This should be configured as a "watch" task in your Gruntfile, and run
  // after tinylr-start.
  //
  // Example
  //
  //      watch: {
  //        reload: {
  //          files: ['**/*.html', '**/*.js', '**/*.css', '**/*.{png,jpg}'],
  //          tasks: 'tinylr-reload'
  //        }
  //      }
  //
  grunt.registerTask('tinylr-reload', 'Sends a reload notification to the livereload server, based on `watchFiles.changed`', function() {
    if(!server) return;
    var files = changed();
    grunt.log.verbose.writeln('... Reloading ' + grunt.log.wordlist(files) + ' ...');
    server.changed({
      body: {
        files: files
      }
    });
  });

  // Helpers

  // This normalize the list of changed files between 0.4 and 0.3. If
  // `watchFiles` is available, then use that.
  //
  // Otherwise, go through each watch config with `reload` as part of their
  // `tasks`, concat all the files, and maintain a list of mtime. A changed
  // files is simply a file with a "newer" mtime.
  function changed() {
    if(grunt.file.watchFiles) return grunt.file.watchFiles.changed;

    var watch = grunt.config('watch');

    var files = Object.keys(watch).filter(function(target) {
      var tasks = watch[target].tasks;
      if(!tasks) return false;
      return ~tasks.indexOf('reload');
    }).reduce(function(list, target) {
      return list.concat(watch[target].files || []);
    }, []);

    files = grunt.file.expandFiles(files).filter(ignore('node_modules'));

    // stat compare
    var stats = changed.stats = changed.stats || {};

    var current = files.map(function(filepath) {
      var stat = fs.statSync(filepath);
      stat.file = filepath;
      return stat;
    }).reduce(function(o, stat) {
      o[stat.file] = stat.mtime.getTime();
      return o;
    }, {});


    files = Object.keys(current).filter(function(file) {
      if(!stats[file]) return true;
      return stats[file] !== current[file];
    });


    changed.stats = current;
    return files;
  }


  // filter helper
  function ignore(pattern) { return function(item) {
    return !~item.indexOf(pattern);
  }}

};
