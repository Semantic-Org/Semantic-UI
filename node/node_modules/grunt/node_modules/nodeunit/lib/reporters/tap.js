/**
 * Module dependencies
 */

var nodeunit = require('../nodeunit'),
    path = require('path'),
    assert = require('tap').assert,
    TapProducer = require('tap').Producer;

/**
 * Reporter info string
 */

exports.info = "TAP output";

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

    var paths = files.map(function (p) {
        return path.join(process.cwd(), p);
    });
    var output = new TapProducer();
    output.pipe(process.stdout);

    nodeunit.runFiles(paths, {
        testStart: function (name) {
            output.write(name.toString());
        },
        testDone: function (name, assertions) {
            assertions.forEach(function (e) {
                var extra = {};
                if (e.error) {
                    extra.error = {
                        name: e.error.name,
                        message: e.error.message,
                        stack: e.error.stack.split(/\n/).filter(function (line) {
                            // exclude line of "types.js"
                            return ! RegExp(/types.js:83:39/).test(line);
                        }).join('\n')
                    };
                    extra.wanted = e.error.expected;
                    extra.found = e.error.actual;
                }
                output.write(assert(e.passed(), e.message, extra));
            });
        },
        done: function (assertions) {
            output.end();
        }
    });
};
