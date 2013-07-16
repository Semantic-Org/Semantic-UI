[![Build Status](https://travis-ci.org/visionmedia/nib.png?branch=master)](https://travis-ci.org/visionmedia/nib)

# Nib

  Stylus mixins, utilities, components, and gradient image generation. Don't forget to check out the [documentation](http://visionmedia.github.com/nib/).

## Installation

```bash
$ npm install nib
```

 If the image generation features of Nib are desired, such as generating the linear gradient images, install [node-canvas](http://github.com/learnboost/node-canvas):
 
```bash 
$ npm install canvas
```

## JavaScript API

 Below is an example of how to utilize nib and stylus with the connect framework (or express).

```javascript
var connect = require('connect')
  , stylus = require('stylus')
  , nib = require('nib');

var server = connect();

function compile(str, path) {
  return stylus(str)
	.set('filename', path)
	.set('compress', true)
	.use(nib());
}

server.use(stylus.middleware({
	src: __dirname
  , compile: compile
}));
```

## Stylus API

  To gain access to everything nib has to offer, simply add:

  ```css
  @import 'nib'
  ```
  
  Or you may also pick and choose based on the directory structure in `./lib`, for example:
  
  ```css
  @import 'nib/gradients'
  @import 'nib/overflow'
  ```
  
to be continued....

## More Information

  - Introduction [screencast](http://www.screenr.com/M6a)

## Testing

 You will first need to install the dependencies:
 
 ```bash
    $ npm install -d
 ```
 
 Run the automated test cases:
 
 ```bash
    $ make test
 ```
 
 For visual testing run the test server:
 
 ```bash
    $ make test-server
 ```
 
 Then visit `localhost:3000` in your browser.

## Contributors

  - TJ Holowaychuk
  - Isaac Johnston

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
