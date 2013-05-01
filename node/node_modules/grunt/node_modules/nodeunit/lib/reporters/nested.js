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
    path = require('path'),
    AssertionError = require('../assert').AssertionError;

/**
 * Reporter info string
 */

exports.info = "Nested test reporter";


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
            __dirname + '/../../bin/nodeunit.json',
            'utf8'
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

    var spaces_per_indent = options.spaces_per_indent || 4;

    var start = new Date().getTime();
    var paths = files.map(function (p) {
        return path.join(process.cwd(), p);
    });
    var tracker = track.createTracker(function (tracker) {
        var i, names;
        if (tracker.unfinished()) {
            console.log('');
            console.log(error(bold(
                'FAILURES: Undone tests (or their setups/teardowns): '
            )));
            names = tracker.names();
            for (i = 0; i < names.length; i += 1) {
                console.log('- ' + names[i]);
            }
            console.log('');
            console.log('To fix this, make sure all tests call test.done()');
            process.reallyExit(tracker.unfinished());
        }
    });

    // Object to hold status of each 'part' of the testCase/name array,
    // i.e., whether this part has been printed yet.
    tracker.already_printed = {};

    var pass_text = function (txt) {
        // Print in bold green.
        return bold(ok(txt + " (pass)"));
    };

    var fail_text = function (txt) {
        return bold(error(txt + " (fail) ✖ "));
    };

    var status_text = function (txt, status) {
        if (status === 'pass') {
            return pass_text(txt);
        } else {
            return fail_text(txt);
        }
    };

    /**
     *  Slices an array, returns a string by joining the sliced elements.
     *  @example
     *   > name_slice(['TC1', 'TC1.1', 'mytest'], 1);
     *   "TC1,TC1.1"
     */
    var name_slice = function (name_arr, end_index) {
        return name_arr.slice(0, end_index + 1).join(",");
    };

    var indent = (function () {
        var txt = '';
        var i;
        for (i = 0; i < spaces_per_indent; i++) {
            txt += ' ';
        }
        return txt;
    }());

    // Indent once for each indent_level
    var add_indent = function (txt, indent_level) {
        var k;
        for (k = 0; k < indent_level; k++) {
            txt += indent;
        }
        return txt;
    };

    // If it's not the last element of the name_arr, it's a testCase.
    var is_testCase = function (name_arr, index) {
        return index === name_arr.length - 1 ? false : true;
    };

    var testCase_line = function (txt) {
        return txt + "\n";
    };

    /**
     * Prints (console.log) the nested test status line(s).
     *
     * @param {Array} name_arr - Array of name elements.
     * @param {String} status - either 'pass' or 'fail'.
     * @example
     *   > print_status(['TC1', 'TC1.1', 'mytest'], 'pass');
     *   TC1
     *      TC1.1
     *         mytest (pass)
     */
    var print_status = function (name_arr, status) {
        var txt = '';
        var _name_slice, part, i;
        for (i = 0; i < name_arr.length; i++) {
            _name_slice = name_slice(name_arr, i);
            part = name_arr[i];
            if (!tracker.already_printed[_name_slice]) {
                txt = add_indent(txt, i);
                if (is_testCase(name_arr, i)) {
                    txt += testCase_line(part);
                } else {
                    txt += status_text(part, status);
                }
                tracker.already_printed[_name_slice] = true;
            }
        }
        console.log(txt);
    };

    nodeunit.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {
            console.log('\n' + bold(name));
        },
        testDone: function (name, assertions) {
            tracker.remove(name);

            if (!assertions.failures()) {
                print_status(name, 'pass');
            } else {
                print_status(name, 'fail');
                assertions.forEach(function (a) {
                    if (a.failed()) {
                        a = utils.betterErrors(a);
                        if (a.error instanceof AssertionError && a.message) {
                            console.log(
                                'Assertion Message: ' +
                                    assertion_message(a.message)
                            );
                        }
                        console.log(a.error.stack + '\n');
                    }
                });
            }
        },
        done: function (assertions, end) {
            end = end || new Date().getTime();
            var duration = end - start;
            if (assertions.failures()) {
                console.log(
                    '\n' + bold(error('FAILURES: ')) + assertions.failures() +
                        '/' + assertions.length + ' assertions failed (' +
                        assertions.duration + 'ms)'
                );
            } else {
                console.log(
                    '\n' + bold(ok('OK: ')) + assertions.length +
                        ' assertions (' + assertions.duration + 'ms)'
                );
            }
        },
        testStart: function (name) {
            tracker.put(name);
        }
    });
};
