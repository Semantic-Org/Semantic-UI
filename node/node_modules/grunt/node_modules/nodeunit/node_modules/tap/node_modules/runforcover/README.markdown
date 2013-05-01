runforcover
======

Runforcover is a require-hook library that uses node-bunker to provide code coverage data
for your unit test library, whatever it might be.

methods
=======
var runforcover = require('runforcover');

var coverage = runforcover.cover([RegExp | path]);
-------

Attach runforcover to the global `require` object and patch `require.extensions['.js']` to
provide coverage metadata for all files required after this point. Returns a function
object that can be called to obtain a object keying files to `CoverageData` objects, with 
a method for releasing control back to vanilla `require`. Usage:

````javascript

var coverage = runforcover.cover(/.*/g);

require('some/library');

coverage(function(coverageData) {
    // coverageData is an object keyed by filename.
    var stats = coverageData['/full/path/to/file.js'].stats()

    // the percentage of lines run versus total lines in file
    console.log(stats.percentage);

    // the number of missing lines
    console.log(stats.missing);

    // the number of lines run (seen)
    console.log(stats.seen);

    // an array of line objects representing 'missed' lines
    stats.lines;

    stats.lines.forEach(function(line) {
        // the line number of the line:
        console.log(line.number);

        // returns a string containing the source data for the line:
        console.log(line.source());   
    }); 
   
    // return control back to the original require function
    coverage.release(); 
});
````

license
=======
new BSD.
