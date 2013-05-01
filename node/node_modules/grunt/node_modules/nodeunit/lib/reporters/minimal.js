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
    path = require('path'),
    AssertionError = require('assert').AssertionError;

/**
 * Reporter info string
 */

exports.info = "Pretty minimal output";

/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options, callback) {

    if (!options) {
        // load default options
        var content = fs.readFileSync(
            __dirname + '/../../bin/nodeunit.json', 'utf8'
        );
        options = JSON.parse(content);
    }

    var red   = function (str) {
        return options.error_prefix + str + options.error_suffix;
    };
    var green = function (str) {
        return options.ok_prefix + str + options.ok_suffix;
    };
    var magenta = function (str) {
        return options.assertion_prefix + str + options.assertion_suffix;
    };
    var bold  = function (str) {
        return options.bold_prefix + str + options.bold_suffix;
    };

    var start = new Date().getTime();

	var opts = {
	    testspec: options.testspec,
	    testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            process.stdout.write(bold(name) + ': ');
        },
        moduleDone: function (name, assertions) {
            console.log('');
            if (assertions.failures()) {
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            console.log(
                                'Assertion in test ' + bold(a.testname) + ': ' +
                                magenta(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }

        },
        testStart: function () {
        },
        testDone: function (name, assertions) {
            if (!assertions.failures()) {
                process.stdout.write('.');
            }
            else {
                process.stdout.write(red('F'));
                assertions.forEach(function (assertion) {
                    assertion.testname = name;
                });
            }
        },
        done: function (assertions) {
            var end = new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(red('FAILURES: ')) + assertions.failures() +
                    '/' + assertions.length + ' assertions failed (' +
                    assertions.duration + 'ms)'
                );
            }
            else {
                console.log(
                    '\n' + bold(green('OK: ')) + assertions.length +
                    ' assertions (' + assertions.duration + 'ms)'
                );
            }

            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        }
    };

	if (files && files.length) {
	    var paths = files.map(function (p) {
	        return path.join(process.cwd(), p);
	    });
	    nodeunit.runFiles(paths, opts);
	} else {
		nodeunit.runModules(files,opts);
	}
};
