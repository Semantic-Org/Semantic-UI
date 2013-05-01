# nextTick - Cross environment nextTick polyfill

Can be used in cross environment modules that need nextTick functionality.

When run in Node.js `process.nextTick` is run, in other engines `setImmediate` or `setTimeout(fn, 0)` is used as fallback.

## Installation
### NPM

In your project path:

	$ npm install next-tick

### Browser

You can easily bundle npm packages for browser with [modules-webmake](https://github.com/medikoo/modules-webmake)

## Tests [![Build Status](https://secure.travis-ci.org/medikoo/next-tick.png?branch=master)](https://secure.travis-ci.org/medikoo/next-tick)

	$ npm test
