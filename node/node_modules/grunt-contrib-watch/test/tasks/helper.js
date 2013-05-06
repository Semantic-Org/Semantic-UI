var grunt = require('grunt');
var path = require('path');

module.exports = helper = {};

// where are fixtures are
helper.fixtures = path.join(__dirname, '..', 'fixtures');

// If verbose flag set, display output
helper.verboseLog = function() {};
if (grunt.util._.indexOf(process.argv, '-v') !== -1) {
  helper.verboseLog = function() { console.log.apply(null, arguments); };
}

// helper for creating assertTasks for testing tasks in child processes
helper.assertTask = function assertTask(task, options) {
  var spawn = require('child_process').spawn;
  task = task || 'default';
  options = options || {};

  // get next/kill process trigger
  var trigger = options.trigger || '.*(Waiting).*';
  delete options.trigger;

  // CWD to spawn
  var cwd = options.cwd || process.cwd();
  delete options.cwd;

  // Use grunt this process uses
  var spawnOptions = [process.argv[1]];
  // Turn options into spawn options
  grunt.util._.each(options, function(val, key) {
    spawnOptions.push('--' + key);
    spawnOptions.push(val);
  });
  // Add the tasks to run
  spawnOptions = spawnOptions.concat(task);

  // Return an interface for testing this task
  function returnFunc(runs, done) {
    // Spawn the node this process uses
    var spawnGrunt = spawn(process.argv[0], spawnOptions, {cwd:cwd});
    var out = '';

    if (!grunt.util._.isArray(runs)) {
      runs = [runs];
    }

    // Append a last function to kill spawnGrunt
    runs.push(function() {
      spawnGrunt.kill('SIGINT');
    });

    // After watch starts waiting, run our commands then exit
    spawnGrunt.stdout.on('data', function(data) {
      data = grunt.log.uncolor(String(data));
      out += data;

      // If we should run the next function
      var shouldRun = true;

      // If our trigger has been found
      if (trigger !== false) {
        shouldRun = (new RegExp(trigger, 'gm')).test(data);
      }

      // Run the function
      if (shouldRun) {
        setTimeout(function() {
          var run = runs.shift();
          if (typeof run === 'function') { run(); }
        }, 500);
      }
    });

    // Throw errors for better testing
    spawnGrunt.stderr.on('data', function(data) {
      throw new Error(data);
    });

    // On process exit return what has been outputted
    spawnGrunt.on('exit', function() {
      done(out);
    });
  }
  returnFunc.options = options;
  return returnFunc;
};

// clean up files within fixtures
helper.cleanUp = function cleanUp(files) {
  if (typeof files === 'string') files = [files];
  files.forEach(function(filepath) {
    filepath = path.join(helper.fixtures, filepath);
    if (grunt.file.exists(filepath)) {
      grunt.file.delete(filepath);
    }
  });
};

// Helper for testing cross platform
helper.unixify = function(str) {
  str = grunt.util.normalizelf(str);
  return str.replace(/\\/g, '/');
};
