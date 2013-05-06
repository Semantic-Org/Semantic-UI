[![build status](https://secure.travis-ci.org/GoalSmashers/clean-css.png)](http://travis-ci.org/GoalSmashers/clean-css)
## What is clean-css? ##

Clean-css is a node.js library for minifying CSS files. It does the same job as YUI Compressor's CSS minifier but much faster thanks to many speed optimizations and the node.js' V8 engine.

## Usage ##

### What are the requirements? ###

    node 0.6.0+ on *nix (fully tested on OS X 10.6+ and CentOS)
    node 0.8.0+ on Windows

### How to install clean-css? ###

    npm install clean-css

### How to use clean-css? ###

To minify a **public.css** file into **public-min.css** do:

    cleancss -o public-min.css public.css

To minify the same **public.css** into the standard output skip the -o parameter:

    cleancss public.css

More likely you would like to concatenate couple files like this (if you are on *nix system):

    cat one.css two.css three.css | cleancss -o merged-and-minified.css

or on Windows:

    type one.css two.css three.css | cleancss -o merged-and-minified.css

Or even gzip the result at once:

    cat one.css two.css three.css | cleancss | gzip -9 -c > merged-minified-and-gzipped.css.gz

### How to use clean-css programmatically? ###
```javascript
    var cleanCSS = require('clean-css');
    var source = "a{font-weight:bold;}";
    var minimized = cleanCSS.process(source);
```
Process method accepts a hash as a second parameter (i.e. `cleanCSS.process(source, options)`), with the following options available:

* `keepSpecialComments` - `*` for keeping all (default), `1` for keeping first one, `0` for removing all
* `keepBreaks` - whether to keep line breaks (default is false)
* `removeEmpty` - whether to remove empty elements (default is false)
* `debug` - turns on debug mode (measuring time spent on cleaning up - run `make bench` to see example)

### How do you preserve a comment block? ###

Use `/*!` notation instead of standard one (i.e. `/*`):

    /*!
      Important comments included in minified output.
    */

### How to run clean-css tests? ###

First clone the source, then run:

    npm test

on *nix systems. If you are under Windows then run:

    test.bat

## Acknowledgments ##

* Vincent Voyer (@vvo) for a patch with better empty element regex and for inspiring us to do many performance improvements in 0.4 release.
* Isaac (@facelessuser) for pointing out a flaw in clean-css' stateless mode.
* Jan Michael Alonzo (@jmalonzo) for a patch removing node's old 'sys' package.
* @XhmikosR for suggesting new features (option to remove special comments and strip out urls quotation) and pointing out numerous improvements (JSHint, media queries).

## License ##

Clean-css is released under the [MIT License](http://opensource.org/licenses/MIT).
