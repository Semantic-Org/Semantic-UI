# Js2Coffee

[![Check this project's build status on TravisCI](https://secure.travis-ci.org/rstacruz/js2coffee.png?branch=master)](http://travis-ci.org/rstacruz/js2coffee)
[![View this project's NPM page](https://badge.fury.io/js/js2coffee.png)](https://npmjs.org/package/js2coffee)

A JavaScript to [CoffeeScript](http://coffeescript.org/) compiler


## Install

	npm install -g js2coffee


## Usage

	js2coffee input_file.js
	js2coffee input_file.js > output.coffee
	cat input.js | js2coffee


## Development

Setup dependencies

	npm install

Watch, compile, bundle, and test the project

	./node_modules/.bin/docpad run


## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/jquery-slidescrollpanel/blob/master/History.md#files)


## License
<br/>Copyright © 2011+ [Rico Sta. Cruz](http://ricostacruz.com) <hi@ricostacruz.com>


## Thanks

Made possible thanks to the hard work of Js2coffee's dependency projects:

- [Narcissus](https://github.com/mozilla/narcissus), Mozilla's JavaScript engine
- [Node Narcissus](https://github.com/kuno/node-narcissus), the Node port of Narcissus
- [Underscore.js](http://documentcloud.github.com/underscore)

And of course:

- Jeremy Ashkenas's [CoffeeScript](http://jashkenas.github.com/coffee-script/)
