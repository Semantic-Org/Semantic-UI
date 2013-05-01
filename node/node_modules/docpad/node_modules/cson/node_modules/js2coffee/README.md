# JS2Coffee
#### A JavaScript to CoffeeScript compiler.

    $ npm install js2coffee

Usage:

    $ js2coffee input_file.js
    $ js2coffee input_file.js > output.coffee
    $ cat input.js | js2coffee

### Development

Run tests:

    $ npm test

Build the browser version:

    $ cake build

### Acknowledgements

Made possible thanks to the hard work of Js2coffee's dependency projects:

 * [Narcissus](https://github.com/mozilla/narcissus), Mozilla's JavaScript engine
 * [Node Narcissus](https://github.com/kuno/node-narcissus), the Node port of Narcissus
 * [Underscore.js](http://documentcloud.github.com/underscore)

And of course:

 * Jeremy Ashkenas's [CoffeeScript](http://jashkenas.github.com/coffee-script/)
