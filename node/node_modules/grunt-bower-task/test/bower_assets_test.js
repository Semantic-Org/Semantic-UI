'use strict';

var path = require('path');
var grunt = require('grunt');

var EventEmitter = require('events').EventEmitter;

var BowerAssets = require('../tasks/lib/bower_assets');

/*
 ======== A Handy Little Nodeunit Reference ========
 https://github.com/caolan/nodeunit

 Test methods:
 test.expect(numAssertions)
 test.done()
 Test assertions:
 test.ok(value, [message])
 test.equal(actual, expected, [message])
 test.notEqual(actual, expected, [message])
 test.deepEqual(actual, expected, [message])
 test.notDeepEqual(actual, expected, [message])
 test.strictEqual(actual, expected, [message])
 test.notStrictEqual(actual, expected, [message])
 test.throws(block, [error], [message])
 test.doesNotThrow(block, [error], [message])
 test.ifError(value)
 */


function verify(name, message, expected, test, bower) {
  function setupBowerConfig(name) {
    return new BowerAssets(bower, path.join(__dirname, 'fixtures', name));
  }

  var bowerAssets = setupBowerConfig(name);
  bowerAssets.get()
    .on('data', function(actual) {
      test.deepEqual(actual, expected, message);
      test.done();
    })
    .on('error', function(err) {
      test.ok(false, err);
      test.done();
    });
}

exports.bower_assets = {
  setUp: function(done) {
    var bowerCommands = {
      list: new EventEmitter()
    };
    this.bowerCommands = bowerCommands;

    this.bower = {
      commands: {
        list: function() {
          return bowerCommands.list;
        }
      },
      config: {
        json: 'component.json',
        directory: 'components'
      }
    };

    done();
  },

  tearDown: function(done) {
    delete this.bowerCommands;
    delete this.bower;
    done();
  },

  currentStateOfBower: function(test) {
    test.expect(1);

    var expected = {
      "__untyped__": {
        "jquery": [path.normalize("components/jquery/jquery.js")]
      }
    };

    verify(
      'current_state_of_bower',
      'should return all main paths in "__untyped__" group',
      expected,
      test,
      this.bower);

    this.bowerCommands.list.emit('data', {"jquery": path.normalize("components/jquery/jquery.js")});
  },

  extendedComponentJson: function(test) {
    test.expect(1);

    var expected = {
      "__untyped__": {
        "jquery": [ path.normalize("components/jquery/jquery.js") ]
      },
      "js": {
        "bootstrap-sass": [
          path.normalize("components/bootstrap-sass/js/bootstrap-affix.js"),
          path.normalize("components/bootstrap-sass/js/bootstrap-modal.js")
        ]
      },
      "scss": {
        "bootstrap-sass": [ path.normalize("components/bootstrap-sass/lib/_mixins.scss") ]
      }
    };

    verify(
      'extended_component_json',
      'should return extended set of paths in "js" and "scss" groups',
      expected,
      test,
      this.bower);

    this.bowerCommands.list.emit('data', {
      "bootstrap-sass": [
        path.normalize("components/bootstrap-sass/docs/assets/js/bootstrap.js"),
        path.normalize("components/bootstrap-sass/docs/assets/css/bootstrap.css")
      ],
      "jquery": path.normalize("components/jquery/jquery.js")
    });
  },

  overrideHonoringNativeBowerConfiguration: function(test) {
    test.expect(1);

    var expected = {
      "__untyped__": {
        "jquery": [ path.normalize("bo_co/jquery/jquery.js") ]
      },
      "js": {
        "bootstrap": [
          path.normalize("bo_co/bootstrap/js/bootstrap-affix.js")
        ]
      },
      "scss": {
        "bootstrap": [ path.normalize("bo_co/bootstrap/lib/_mixins.scss") ]
      }
    };

    this.bower.config.directory = 'bo_co';

    verify(
      'honor_bowerrc',
      'should honor native Bower configuration while overriding packages',
      expected,
      test,
      this.bower);

    this.bowerCommands.list.emit('data', {
      "bootstrap": [
        path.normalize("bo_co/bootstrap/docs/assets/js/bootstrap.js"),
        path.normalize("bo_co/bootstrap/docs/assets/css/bootstrap.css")
      ],
      "jquery": path.normalize("bo_co/jquery/jquery.js")
    });
  }
};
