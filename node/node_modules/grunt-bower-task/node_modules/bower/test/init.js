/*jshint plusplus:false*/
var assert = require('assert');
var init   = require('../lib/commands/init');

var cwd = process.cwd();

var setPackage = function (name) {
  return function () {
    cwd = process.cwd();
    process.chdir(__dirname + '/assets/' + name);
  };
};

var restorecwd = function () {
  process.chdir(cwd);
};

describe('init', function () {
  var savedData;

  init.Init.prototype.save = function (data) {
    savedData = data;
  };

  describe('defaults', function () {
    before(setPackage('package-new'));
    after(restorecwd);

    it('Should ask you five questions and output default answers', function (next) {
      var counter = 0;

      var questions = [
        'name: [package-new]',
        'version: [0.0.0]',
        'main file: [index.js]',
        'add commonly ignored files to ignore list? (y/n): [y]'
      ];

      init()
        .on('prompt', function (prompt) {
          assert.strictEqual(prompt, questions[counter++]);
          process.stdin.emit('data', '\n');
        })
        .on('end', function () {
          assert.strictEqual(counter, 4);
          assert.deepEqual(savedData, {
            name: 'package-new',
            version: '0.0.0',
            main: 'index.js',
            ignore: ['**/.*', 'node_modules', 'components']
          });
          next();
        });
    });
  });

  describe('non-defaults', function () {
    before(setPackage('package-new'));
    after(restorecwd);

    it('Should use your answers', function (next) {
      var counter = 0;
      var answers = ['different-name', '2.3.1', 'other.js', 'n'];

      init()
        .on('prompt', function () {
          process.stdin.emit('data', answers[counter++] + '\n');
        })
        .on('end', function () {
          assert.strictEqual(counter, 4);
          assert.deepEqual(savedData, {
            name: 'different-name',
            version: '2.3.1',
            main: 'other.js'
          });

          next();
        });
    });
  });

  describe('existing JSON', function () {
    before(setPackage('package-existing-json'));
    after(restorecwd);

    it('Uses the existing values as defaults', function (next) {
      var counter = 0;

      var questions = [
        'name: [sample-package]',
        'version: [1.2.3]',
        'main file: [sample.js]',
        'add commonly ignored files to ignore list? (y/n): [y]'
      ];

      init()
        .on('prompt', function (prompt) {
          assert.strictEqual(prompt, questions[counter++]);
          process.stdin.emit('data', '\n');
        })
        .on('end', function () {
          assert.strictEqual(counter, 4);
          assert.deepEqual(savedData, {
            'name': 'sample-package',
            'version': '1.2.3',
            'main': ['sample.js'],
            'ignore': [
              '**/.*',
              'node_modules',
              'components'
            ],
            'custom': 'A custom field'
          });
          next();
        });
    });
  });

  describe('existing dependencies', function () {
    before(setPackage('package-existing-components'));
    after(restorecwd);

    it('Should output the correct components and versions', function (next) {
      var counter = 0;

      var questions = [
        'name: [package-existing-components]',
        'version: [0.0.0]',
        'main file: []',
        'add current components as dependencies? (y/n): [y]',
        'add commonly ignored files to ignore list? (y/n): [y]'
      ];

      init()
        .on('prompt', function (prompt) {
          assert.strictEqual(prompt, questions[counter++]);
          process.stdin.emit('data', '\n');
        })
        .on('end', function () {
          assert.strictEqual(counter, 5);
          assert.deepEqual(savedData, {
            'name': 'package-existing-components',
            'version': '0.0.0',
            'dependencies': {
              'backbone': '~0.9.10',
              'jquery': '~1.9.1',
              'underscore': '~1.4.4'
            },
            'ignore': [
              '**/.*',
              'node_modules',
              'components'
            ]
          });

          next();
        });
    });
  });
});
