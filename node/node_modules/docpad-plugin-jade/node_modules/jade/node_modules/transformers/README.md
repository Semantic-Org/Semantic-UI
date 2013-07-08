[![Build Status](https://travis-ci.org/ForbesLindesay/transformers.png?branch=master)](https://travis-ci.org/ForbesLindesay/transformers)
# transformers

  String/Data transformations for use in templating libraries, static site generators and web frameworks.  This gathers the most useful transformations you can apply to text or data into one library with a consistent API.  Transformations can be pretty much anything but most are either compilers or templating engines.

## Supported transforms

  To use each of these transforms you will also need to install the associated npm module for that transformer.

### Template engines

  - [atpl](http://documentup.com/soywiz/atpl.js) - Compatible with twig templates
  - [coffeecup](http://documentup.com/gradus/coffeecup) - pure coffee-script templates (fork of coffeekup)
  - [dot](http://documentup.com/olado/doT) [(website)](https://github.com/Katahdin/dot-packer) - focused on speed
  - [dust](http://documentup.com/akdubya/dustjs) [(website)](http://akdubya.github.com/dustjs/) - asyncronous templates
  - [eco](http://documentup.com/sstephenson/eco) - Embedded CoffeeScript templates
  - [ect](http://documentup.com/baryshev/ect) [(website)](http://ectjs.com/) - Embedded CoffeeScript templates
  - [ejs](http://documentup.com/visionmedia/ejs) - Embedded JavaScript templates
  - [haml](http://documentup.com/visionmedia/haml.js) [(website)](http://haml-lang.com/) - dry indented markup
  - [haml-coffee](http://documentup.com/netzpirat/haml-coffee/) [(website)](http://haml-lang.com/) - haml with embedded CoffeeScript
  - [handlebars](http://documentup.com/wycats/handlebars.js/) [(website)](http://handlebarsjs.com/) - extension of mustache templates
  - [hogan](http://documentup.com/twitter/hogan.js) [(website)](http://twitter.github.com/hogan.js/) - Mustache templates
  - [jade](http://documentup.com/visionmedia/jade) [(website)](http://jade-lang.com/) - robust, elegant, feature rich template engine
  - [jazz](http://documentup.com/shinetech/jazz)
  - [jqtpl](http://documentup.com/kof/jqtpl) [(website)](http://api.jquery.com/category/plugins/templates/) - extensible logic-less templates
  - [JUST](http://documentup.com/baryshev/just) - EJS style template with some special syntax for layouts/partials etc.
  - [liquor](http://documentup.com/chjj/liquor) - extended EJS with significant white space
  - [mustache](http://documentup.com/janl/mustache.js) - logic less templates
  - [QEJS](http://documentup.com/jepso/QEJS) - Promises + EJS for async templating
  - [swig](http://documentup.com/paularmstrong/swig) [(website)](http://paularmstrong.github.com/swig/) - Django-like templating engine
  - [templayed](http://documentup.com/archan937/templayed.js/) [(website)](http://archan937.github.com/templayed.js/) - Mustache focused on performance
  - [toffee](http://documentup.com/malgorithms/toffee) - templating language based on coffeescript
  - [underscore](http://documentup.com/documentcloud/underscore) [(website)](http://documentcloud.github.com/underscore/)
  - [walrus](http://documentup.com/jeremyruppel/walrus) - A bolder kind of mustache
  - [whiskers](http://documentup.com/gsf/whiskers.js/tree/) - logic-less focused on readability

### Stylesheet Languages

  - [less](http://documentup.com/cloudhead/less.js) [(website)](http://lesscss.org/) - LESS extends CSS with dynamic behavior such as variables, mixins, operations and functions.
  - [stylus](http://documentup.com/learnboost/stylus) [(website)](http://learnboost.github.com/stylus/) - revolutionary CSS generator making braces optional
  - [sass](http://documentup.com/visionmedia/sass.js) [(website)](http://sass-lang.com/) - Sassy CSS

### Minifiers

  - [uglify-js](http://documentup.com/mishoo/UglifyJS2) - No need to install anything, just minifies/beautifies JavaScript
  - [uglify-css](https://github.com/visionmedia/css) - No need to install anything, just minifies/beautifies CSS
  - ugilify-json - No need to install anything, just minifies/beautifies JSON

### Other

  - cdata - No need to install anything, just wrapps text in `<![CDATA[\nYOUR TEXT\n]]>`
  - [coffee-script](http://coffeescript.org/) - `npm install coffee-script`
  - [cson](https://github.com/bevry/cson) - coffee-script based JSON format
  - markdown - You can use `marked`, `supermarked`, `markdown-js` or `markdown`
  - [component-js](http://documentup.com/component/component) [(website)](http://component.io) - `npm install component-builder` options: `{development: false}`
  - [component-css](http://documentup.com/component/component) [(website)](http://component.io) - `npm install component-builder` options: `{development: false}`
  - [html2jade](http://documentup.com/donpark/html2jade) [(website)](http://html2jade.aaron-powell.com/) - `npm install html2jade` - Converts HTML back into jade

Pull requests to add more transforms will always be accepted providing they are open-source, come with unit tests, and don't cause any of the tests to fail.

## API

  The exported object `transformers` is a collection of named transformers.  To access an individual transformer just do:

  ```javascript
  var transformer = require('transformers')['transformer-name']
  ```

### Transformer

  The following options are given special meaning by `transformers`:

   - `filename` is set by transformers automatically if using the `renderFile` APIs.  It is used if `cache` is enabled.
   - `cache` if true, the template function will be cached where possible (templates are still updated if you provide new options, so this can be used in most live applications).
   - `sudoSync` used internally to put some asyncronous transformers into "sudo syncronous" mode.  Don't touch this.
   - `minify` if set to true on a transformer that isn't a minifier, it will cause the output to be minified.  e.g. `coffeeScript.renderSync(str, {minify: true})` will result in minified JavaScript.

#### Transformer.engines

  Returns an array of engines that can be used to power this transformer.  The first of these that's installed will be used for the transformation.

  To enable a transformation just take `[engine] = Transformer.engines[0]` and then do `npm install [engine]`.  If `[engine]` is `.` there is no need to install an engine from npm to use the transformer.

#### Transformer.render(str, options, cb)

  Tranform the string `str` using the `Transformer` with the provided options and call the callback `cb(err, res)`.

  If no `cb` is provided, this method returns a [promises/A+](http://promises-aplus.github.com/promises-spec/) promise.

#### Transformer.renderSync(str, options)

  Synchronous version of `Transformer.render`

#### Transformer.renderFile(filename, options, cb)

  Reads the file at filename into `str` and sets `options.filename = filename` then calls `Transform.render(str, options, cb)`.

  If no `cb` is provided, this method returns a [promises/A+](http://promises-aplus.github.com/promises-spec/) promise.

#### Tranformer.renderFileSync(filename, options)

  Synchronous version of `Tranformer.renderFile`

#### Transformer.outputFormat

  A string, one of:

   - `'xml'`
   - `'css'`
   - `'js'`
   - `'json'`
   - `'text'`

Adding to this list will **not** result in a major version change, so you should handle unexpected types gracefully (I'd suggest default to assuming `'text'`).

#### Transformer.sync

  `true` if the transformer can be used syncronously, `false` otherwise.

## Libraries that don't work synchronously

  The following transformations will always throw an exception if you attempt to run them synchronously:

   1. dust
   2. qejs
   3. html2jade

The following transformations sometimes throw an exception if run syncronously, typically they only throw an exception if you are doing something like including another file.  If you are not doing the things that cause them to fail then they are consistently safe to use syncronously.

   - jade (only when using `then-jade` instead of `jade`)
   - less (when `@import` is used with a url instead of a filename)
   - jazz (When one of the functions passed as locals is asyncronous)

The following libraries look like they might sometimes throw exceptions when used syncronously (if you read the source) but they never actually do so:

   - just
   - ect
   - stylus