/*jshint plusplus:false*/

var fs     = require('fs');
var path   = require('path');
var assert = require('assert');

var complete = require('../lib/util/completion');
var config   = require('../lib/core/config');
var command  = require('../lib/commands/completion');
var commands = require('../lib/commands');

describe('completion', function () {

  before(function () {
    this.opts = complete(['bower', 'install'], {
      COMP_CWORD: '2',
      COMP_LINE: 'bower install',
      COMP_POINT: '14'
    });
  });

  beforeEach(function () {
    this.log = complete.log;
  });

  afterEach(function () {
    complete.log = this.log;
  });

  it('parses COMP_* in the env', function () {
    assert.deepEqual(this.opts, {
      w:            2,
      words:        [ 'bower', 'install' ],
      word:         'install',
      line:         'bower install',
      point:        14,
      length:       13,
      partialLine:  'bower install',
      partialWords: [ 'bower', 'install' ]
    });
  });


  it('filters out completion results', function () {
    var completed = [
      'backbone',
      'backbone-forms',
      'backbone-paginator',
      'backbone.forms',
      'backbone.paginator'
    ];

    var all = complete.abbrev({ word: 'ba' });
    var none = complete.abbrev({ word: 'foobar' });
    var form = complete.abbrev({ word: 'backbone-form' });
    var dots = complete.abbrev({ word: 'backbone.' });
    var dashed = complete.abbrev({ word: 'backbone-' });

    assert.deepEqual(completed.filter(all), completed);
    assert.deepEqual(completed.filter(none), []);
    assert.deepEqual(completed.filter(form), ['backbone-forms']);
    assert.deepEqual(completed.filter(dashed), ['backbone-forms', 'backbone-paginator']);
    assert.deepEqual(completed.filter(dots), ['backbone.forms', 'backbone.paginator']);
  });


  it('dumps the script when COMP_* aren\'t in the env', function (done) {
    command().on('end', function (data) {
      var script = fs.readFileSync(path.join(__dirname, '../templates/completion.mustache'), 'utf8');
      assert.equal(data, script);
      done();
    });
  });

  it('completes the list of command on first word', function () {
    complete.log = function (results) {
      assert.deepEqual(results, Object.keys(commands));
    };

    command([''], {
      COMP_CWORD: '1',
      COMP_LINE: 'bower ',
      COMP_POINT: '6'
    });
  });

  it('completes the list of options on first word', function () {
    complete.log = function (results) {
      assert.deepEqual(results, ['--no-color', '--help', '--version']);
    };

    command(['-'], {
      COMP_CWORD: '1',
      COMP_LINE: 'bower -',
      COMP_POINT: '7'
    });
  });

  it('completes the list of command on invalid command', function () {
    complete.log = function (results) {
      assert.deepEqual(results, Object.keys(commands));
    };

    command(['foobar'], {
      COMP_CWORD: '1',
      COMP_LINE: 'bower foobar',
      COMP_POINT: '12'
    });
  });

  it('delegates to command.completion for each bower command', function (done) {
    complete.log = function (results) {
      assert.ok(results.length);

      var jq = results.filter(function (res) {
        return res === 'jquery';
      });

      assert.equal(jq.length, 1);
    };

    var cmd = command(['install', 'jquery-'], {
      COMP_CWORD: '2',
      COMP_LINE: 'bower install jquery-',
      COMP_POINT: '14'
    });

    cmd.on('end', done);
  });

  describe('cache clean', function () {

    it('caches the result of <endpoint>/packages to the completion cache folder', function (done) {
      complete.log = function () {};

      var cmd = command(['install', 'jquery-'], {
        COMP_CWORD: '2',
        COMP_LINE: 'bower install jquery-',
        COMP_POINT: '14'
      });

      cmd.on('end', function () {
        var cache = path.join(config.completion, 'install.json');
        fs.stat(cache, done);
      });
    });

    it('is cleared with cache-clean command', function (done) {
      commands['cache-clean']().on('end', function () {
        var cache = path.join(config.completion, 'install.json');
        fs.stat(cache, function (err) {
          done(err ? null : new Error('completion results wasn\'t cleaned'));
        });
      });
    });

  });
});
