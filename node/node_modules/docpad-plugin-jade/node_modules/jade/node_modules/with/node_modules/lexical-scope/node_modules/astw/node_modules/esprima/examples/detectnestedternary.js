// Usage: node detectnestedternary.js /path/to/some/directory
// For more details, please read http://esprima.org/doc/#nestedternary

/*jslint node:true sloppy:true plusplus:true */

var fs = require('fs'),
    esprima = require('../esprima'),
    dirname = process.argv[2];


// Executes visitor on the object and its children (recursively).
function traverse(object, visitor) {
    var key, child;

    visitor.call(null, object);
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

        function report(node, problem) {
            if (first === true) {
                console.log(shortname + ': ');
                first = false;
            }
            console.log('  Line', node.loc.start.line, ':', problem);
        }

        function checkConditional(node) {
            var condition;

            if (node.consequent.type === 'ConditionalExpression' ||
                    node.alternate.type === 'ConditionalExpression') {

                condition = content.substring(node.test.range[0], node.test.range[1]);
                if (condition.length > 20) {
                    condition = condition.substring(0, 20) + '...';
                }
                condition = '"' + condition + '"';
                report(node, 'Nested ternary for ' + condition);
            }
        }

        try {
            content = fs.readFileSync(filename, 'utf-8');
            syntax = esprima.parse(content, { tolerant: true, loc: true, range: true });
            traverse(syntax, function (node) {
                if (node.type === 'ConditionalExpression') {
                    checkConditional(node);
                }
            });
        } catch (e) {
        }

    });
});
