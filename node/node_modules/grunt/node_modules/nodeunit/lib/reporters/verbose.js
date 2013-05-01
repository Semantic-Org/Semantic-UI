/*!
 * Nodeunit
 * Copyright (c) 2010 Caolan McMahon
 * MIT Licensed
 */

/**
 * Module dependencies
 */

var nodeunit = require('../nodeunit'),
    utils = require('../utils'),
    fs = require('fs'),
    track = require('../track'),
    path = require('path');
    AssertionError = require('../assert').AssertionError;

/**
 * Reporter info string
 */

exports.info = "Verbose tests reporter"


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var error = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var ok    = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };
    var assertion_message = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.join(process.cwd(), p);
    });
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    nodeunit.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                console.log('✔ ' + name);
            }
            else {
                console.log(error('✖ ' + name));
            }
            // verbose so print everything
            assertions.forEach(function (a) {
              if (a.failed()) {
                console.log(error('  ✖ ' + a.message));
                a = utils.betterErrors(a);
                console.log('  ' + a.error.stack);
              }
              else {
                console.log('  ✔ ' + a.message);
              }
            });
        },
        done: function (assertions, end) {
            var end = end || new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                   '\n' + bold(ok('OK: ')) + assertions.length +
                   ' assertions (' + assertions.duration + 'ms)'
                );
            }
        },
        testStart: function(name) {
            tracker.put(name);
        }
    });
};
