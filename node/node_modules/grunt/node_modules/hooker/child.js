var path = require('path');
var fs = require('fs');
var nodeunit = require('nodeunit');

var filepaths = fs.readdirSync('test').map(function(filename) {
  return path.join('test', filename);
});

var unfinished = {};
var currentModule;
function sendMessage(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

// If an exception is thrown, let the parent process know and exit.
process.on('uncaughtException', function (e) {
  sendMessage({error: [e.name, e.message, e.stack]});
  process.exit();
});

// If Nodeunit explodes because a test was missing test.done(), handle it.
var unfinished = {};
process.on('exit', function (e) {
  var len = Object.keys(unfinished).length
  if (len > 0) {
    sendMessage({exit: ['UNFINISHED']});
    // process.reallyExit(len);
  } else {
    sendMessage({exit: ['finished']});
  }
  // process.exit();
});

nodeunit.reporters.test = {
  run: function(files, options, callback) {
    // Nodeunit needs absolute paths.
    var paths = files.map(function (filepath) {
      return path.resolve(filepath);
    });
    nodeunit.runFiles(paths, {
      // No idea.
      testspec: undefined,
      // Executed when the first test in a file is run. If no tests exist in
      // the file, this doesn't execute.
      moduleStart: function(name) {
        // Keep track of this so that moduleDone output can be suppressed in
        // cases where a test file contains no tests.
        currentModule = name;
        // Send back to the parent process.
        sendMessage({moduleStart: [name.toString()]});
      },
      // Executed after a file is done being processed. This executes whether
      // tests exist in the file or not.
      moduleDone: function(name) {
        // Abort if no tests actually ran.
        if (name !== currentModule) { return; }
        // Send back to the parent process.
        sendMessage({moduleDone: [name.toString()]});
      },
      // Executed before each test is run.
      testStart: function(name) {
        // Keep track of the current test, in case test.done() was omitted
        // and Nodeunit explodes.
        unfinished[name] = name;
        // Send back to the parent process.
        sendMessage({testStart: [name.toString()]});
      },
      // Executed after each test and all its assertions are run.
      testDone: function(name, assertions) {
        delete unfinished[name];
        // Send back to the parent process.
        sendMessage({testDone: [
          name.toString(),
          assertions.failures(),
          assertions.map(function(assertion) {
            var e = assertion.error;
            if (e) {
              assertion.error = {
                name: e.name,
                message: e.message,
                stack: e.stack
              };
            }
            return assertion;
          })
        ]});
      },
      // Executed when everything is all done.
      done: function (assertions) {
        // Send back to the parent process.
        sendMessage({done: [
          assertions.failures(),
          assertions.duration,
          assertions
        ]});
      }
    });
  }
}

nodeunit.reporters.test.run(filepaths, {});
