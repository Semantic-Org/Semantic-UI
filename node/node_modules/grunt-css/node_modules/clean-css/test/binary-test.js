var vows = require('vows'),
  assert = require('assert'),
  exec = require('child_process').exec,
  fs = require('fs');

var isWindows = process.platform == 'win32';
var lineBreak = isWindows ? /\r\n/g : /\n/g;

var binaryContext = function(options, context) {
  context.topic = function() {
    // We add __DIRECT__=1 to switch binary into 'non-piped' mode
    if (isWindows)
      exec("set __DIRECT__=1 & node .\\bin\\cleancss " + options, this.callback);
    else
      exec("__DIRECT__=1 ./bin/cleancss " + options, this.callback);
  };
  return context;
};

var pipedContext = function(css, options, context) {
  if (isWindows)
    return {};

  context.topic = function() {
    exec("echo \"" + css + "\" | ./bin/cleancss " + options, this.callback);
  };
  return context;
};

exports.commandsSuite = vows.describe('binary commands').addBatch({
  'no options': binaryContext('', {
    'should output help': function(stdout) {
      assert.equal(/usage:/.test(stdout), true);
    }
  }),
  'help': binaryContext('-h', {
    'should output help': function(error, stdout) {
      assert.equal(/usage:/.test(stdout), true);
    }
  }),
  'version': binaryContext('-v', {
    'should output help': function(error, stdout) {
      var version = JSON.parse(fs.readFileSync('./package.json')).version;
      assert.equal(stdout, version + "\n");
    }
  }),
  'stdin': pipedContext("a{color: #f00}", '', {
    'should output data': function(error, stdout) {
      assert.equal(stdout, "a{color:red}");
    }
  }),
  'no empty by default': pipedContext('a{}', '', {
    'should preserve content': function(error, stdout) {
      assert.equal(stdout, "a{}");
    }
  }),
  'strip all but first comment': pipedContext('/*!1st*//*! 2nd */a{}', '--s1', {
    'should keep the 2nd comment': function(error, stdout) {
      assert.equal(stdout, "/*!1st*/a{}");
    }
  }),
  'strip all comments': pipedContext('/*!1st*//*! 2nd */a{}', '--s0', {
    'should keep the 2nd comment': function(error, stdout) {
      assert.equal(stdout, "a{}");
    }
  }),
  'empty': pipedContext('a{}', '-e', {
    'should preserve content': function(error, stdout) {
      assert.equal(stdout, "");
    }
  }),
  'from source': binaryContext('./test/data/reset.css', {
    'should minimize': function(error, stdout) {
      var minimized = fs.readFileSync('./test/data/reset-min.css', 'utf-8').replace(lineBreak, '');
      assert.equal(stdout, minimized);
    }
  }),
  'to file': binaryContext('-o reset-min.css ./test/data/reset.css', {
    'should give no output': function(error, stdout) {
      assert.equal(stdout, '');
    },
    'should minimize': function() {
      var minimized = fs.readFileSync('./test/data/reset-min.css', 'utf-8').replace(lineBreak, '');
      var target = fs.readFileSync('./reset-min.css', 'utf-8').replace(lineBreak, '');
      assert.equal(minimized, target);
    },
    teardown: function() {
      if (isWindows)
        exec('del /q /f reset-min.css');
      else
        exec('rm reset-min.css');
    }
  })
});