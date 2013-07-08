// Usage: node findbooleantrap.js /path/to/some/directory
// For more details, please read http://esprima.org/doc/#booleantrap.

/*jslint node:true sloppy:true plusplus:true */

var fs = require('fs'),
    esprima = require('../esprima'),
    dirname = process.argv[2],
    doubleNegativeList = [];


// Black-list of terms with double-negative meaning.
doubleNegativeList = [
    'hidden',
    'caseinsensitive',
    'disabled'
];


// Executes visitor on the object and its children (recursively).
function traverse(object, visitor) {
    var key, child;

    if (visitor.call(null, object) === false) {
        return;
    }
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

// http://stackoverflow.com/q/5827612/
function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) {
            return done(err);
        }
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) {
                return done(null, results);
            }
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        }());
    });
}

walk(dirname, function (err, results) {
    if (err) {
        console.log('Error', err);
        return;
    }

    results.forEach(function (filename) {
        var shortname, first, content, syntax;

        shortname = filename;
        first = true;

        if (shortname.substr(0, dirname.length) === dirname) {
            shortname = shortname.substr(dirname.length + 1, shortname.length);
        }

        function getFunctionName(node) {
            if (node.callee.type === 'Identifier') {
                return node.callee.name;
            }
            if (node.callee.type === 'MemberExpression') {
                return node.callee.property.name;
            }
        }

        function report(node, problem) {
            if (first === true) {
                console.log(shortname + ': ');
                first = false;
            }
            console.log('  Line', node.loc.start.line, 'in function',
                 getFunctionName(node) + ':', problem);
        }

        function checkSingleArgument(node) {
            var args = node['arguments'],
                functionName = getFunctionName(node);

            if ((args.length !== 1) || (typeof args[0].value !== 'boolean')) {
                return;
            }

            // Check if the method is a setter, i.e. starts with 'set',
            // e.g. 'setEnabled(false)'.
            if (functionName.substr(0, 3) !== 'set') {
                report(node, 'Boolean literal with a non-setter function');
            }

            // Does it contain a term with double-negative meaning?
            doubleNegativeList.forEach(function (term) {
                if (functionName.toLowerCase().indexOf(term.toLowerCase()) >= 0) {
                    report(node, 'Boolean literal with confusing double-negative');
                }
            });
        }

        function checkMultipleArguments(node) {
            var args = node['arguments'],
                literalCount = 0;

            args.forEach(function (arg) {
                if (typeof arg.value === 'boolean') {
                    literalCount++;
                }
            });

            // At least two arguments must be Boolean literals.
            if (literalCount >= 2) {

                // Check for two different Boolean literals in one call.
                if (literalCount === 2 && args.length === 2) {
                    if (args[0].value !== args[1].value) {
                        report(node, 'Confusing true vs false');
                        return;
                    }
                }

                report(node, 'Multiple Boolean literals');
            }
        }

        function checkLastArgument(node) {
            var args = node['arguments'];

            if (args.length < 2) {
                return;
            }

            if (typeof args[args.length - 1].value === 'boolean') {
                report(node, 'Ambiguous Boolean literal as the last argument');
            }
        }

        try {
            content = fs.readFileSync(filename, 'utf-8');
            syntax = esprima.parse(content, { tolerant: true, loc: true });
            traverse(syntax, function (node) {
                if (node.type === 'CallExpression') {
                    checkSingleArgument(node);
                    checkLastArgument(node);
                    checkMultipleArguments(node);
                }
            });
        } catch (e) {
        }

    });
});
