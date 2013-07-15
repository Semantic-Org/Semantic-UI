/*jslint node:true */
var fs = require('fs'),
    esprima = require('../esprima'),
    files = process.argv.splice(2),
    histogram,
    type;

histogram = {
    Boolean: 0,
    Identifier: 0,
    Keyword: 0,
    Null: 0,
    Numeric: 0,
    Punctuator: 0,
    RegularExpression: 0,
    String: 0
};

files.forEach(function (filename) {
    'use strict';
    var content = fs.readFileSync(filename, 'utf-8'),
        tokens = esprima.parse(content, { tokens: true }).tokens;

    tokens.forEach(function (token) {
        histogram[token.type] += 1;
    });
});

for (type in histogram) {
    if (histogram.hasOwnProperty(type)) {
        console.log(type, histogram[type]);
    }
}
