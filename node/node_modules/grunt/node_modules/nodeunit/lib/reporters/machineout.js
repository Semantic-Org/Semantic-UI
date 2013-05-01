/*!
 * Nodeunit
 *
 * @author  Alisue (lambdalisue@hashnote.net)
 * @url     http://hashnote.net/
 *
 * Copyright (c) 2011 Alisue
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

exports.info = "Tests reporter for machinally analysis";


/**
 * Run all tests within each module, reporting the results to the command-line.
 *
 * @param {Array} files
 * @api public
 */

exports.run = function (files, options, callback) {
    // options doesn't effect

    var parseStack = function (stack, delimiter) {
        var parseTrace = function (trace) {
            var filename, row, column;
            pattern1 = /\s{4}at\s\S+\s\(([^:]+):(\d+):(\d+)\)/;
            pattern2 = /\s{4}at\s([^:]+):(\d+):(\d+)/;

            if (trace.match(pattern1) !== null) {
                filename = RegExp.$1;
                row = RegExp.$2;
                column = RegExp.$3;
            } else if (trace.match(pattern2) !== null) {
                filename = RegExp.$1;
                row = RegExp.$2;
                column = RegExp.$3;
            } else {
                throw new Error("Could not parse a line of stack trace: " + trace);
            }
            return {filename: filename, row: row, column: column};
        };
        if (delimiter === undefined) {
            delimiter = ':';
        }
        traceback = stack.split('\n');
        firstline = traceback.shift();
        trace = parseTrace(traceback[0]);
        return {filename: trace.filename, row: trace.row, column: trace.column, message: firstline};
    };
    var createErrorMessage = function(type, name, filename, row, column, message){
        return [type, name, filename, row, column, message].join(":");
    };
    var paths = files.map(function (p) {
        return path.join(process.cwd(), p);
    });
    var tracker = track.createTracker(function (tracker) {
        if (tracker.unfinished()) {
            var names = tracker.names();
            for (var i = 0; i < names.length; i += 1) {
                console.log(createErrorMessage(
                    'Error', names[i], 
                    '', '', '', 
                    'Undone tests - To fix this, make sure all tests call test.done()'
                ));
            }
            process.reallyExit(tracker.unfinished());
        }
    });

    nodeunit.runFiles(paths, {
        testspec: options.testspec,
        testFullSpec: options.testFullSpec,
        moduleStart: function (name) {},
        testDone: function (name, assertions) {
            tracker.remove(name);
            if (assertions.failures()) {
                assertions.forEach(function (a) {
                    var stacks, message, filename, row, column;
                    if (a.failed()) {
                        stackinfo = parseStack(a.error.stack, ':');
                        console.log(createErrorMessage(
                            'Fail', name, stackinfo.filename,
                            stackinfo.row, stackinfo.column, stackinfo.message));
                    }
                });
            }
        },
        done: function (assertions, end) {
            if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
        },
        testStart: function(name) {
            tracker.put(name);
        }
    });
};

