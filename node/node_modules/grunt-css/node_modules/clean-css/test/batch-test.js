var vows = require('vows'),
  path = require('path'),
  fs = require('fs'),
  assert = require('assert'),
  cleanCSS = require('../index');

var lineBreak = process.platform == 'win32' ? /\r\n/g : /\n/g;

var batchContexts = function() {
  var context = {};
  fs.readdirSync(path.join(__dirname, 'data')).forEach(function(filename) {
    if (/min.css$/.exec(filename)) return;
    var testName = filename.split('.')[0];

    context[testName] = {
      topic: function() {
        var plainPath = path.join(__dirname, 'data', testName + '.css');
        var minPath = path.join(__dirname, 'data', testName + '-min.css');

        return {
          plain: fs.readFileSync(plainPath, 'utf-8'),
          minimized: fs.readFileSync(minPath, 'utf-8')
        };
      }
    };
    context[testName]['minimizing ' + testName + '.css'] = function(data) {
      var processed = cleanCSS.process(data.plain, {
        removeEmpty: true,
        keepBreaks: true
      });

      var processedTokens = processed.split(lineBreak);
      var minimizedTokens = data.minimized.split(lineBreak);

      processedTokens.forEach(function(line, i) {
        assert.equal(line, minimizedTokens[i]);
      });
    };
  });

  return context;
};

vows.describe('clean-batch')
  .addBatch(batchContexts())
  .export(module);
