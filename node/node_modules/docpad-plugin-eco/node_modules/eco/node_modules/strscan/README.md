## StringScanner

**StringScanner** is a simple string tokenizer that provides for lexical
scanning operations on a string. It's a JavaScript port of the [Ruby 
library with the same name](http://ruby-doc.org/core/classes/StringScanner.html).

Scanning a string means keeping track of and advancing a position (a
zero-based index into the source string) and matching regular expressions
against the portion of the source string after the position.

StringScanner is written in [CoffeeScript](http://coffeescript.org/) and
distributed via [npm](http://npm.mape.me/) as a [CommonJS 
module](http://www.commonjs.org/).

### Quick start

    $ npm install strscan
    $ node-repl
    > var StringScanner = require("strscan").StringScanner
    > var s = new StringScanner("This is a test")
    > s.scan(/\w+/)             # => "This"
    > s.scan(/\w+/)             # => null
    > s.scan(/\s+/)             # => " "
    > s.scan(/\s+/)             # => null
    > s.scan(/\w+/)             # => "is"
    > s.hasTerminated()         # => false
    > s.scan(/\s+/)             # => " "
    > s.scan(/(\w+)\s+(\w+)/)   # => "a test"
    > s.getMatch()              # => "a test"
    > s.getCapture(0)           # => "a"
    > s.getCapture(1)           # => "test"
    > s.hasTerminated()         # => true

### More

[Clone, fork, or file bugs at GitHub](http://github.com/sstephenson/strscan-js)

[Read the full documentation/annotated source code](http://sstephenson.github.com/strscan-js/)

### Copyright

Copyright (c) 2010 Sam Stephenson. Distributed under the terms of an
MIT-style license. See LICENSE for details.
