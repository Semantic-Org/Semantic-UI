# node-progress

  Flexible ascii progress bar

## Installation

    npm install progress

## Usage

   First we create a `ProgressBar`, giving it a format string
   as well as the `total`, telling the progress bar when it will
   be considered complete. After that all we need to do is `tick()` appropriately. 

```javascript
var ProgressBar = require('progress');

var bar = new ProgressBar(':bar', { total: 10 });
var timer = setInterval(function(){
bar.tick();
  if (bar.complete) {
    console.log('\ncomplete\n');
    clearInterval(timer);
  }
}, 100);
```

## Options:

  - `total` total number of ticks to complete
  - `stream` the output stream defaulting to stdout
  - `complete` completion character defaulting to "="
  - `incomplete` incomplete character defaulting to "-"

## Tokens:

  - `:bar` the progress bar itself
  - `:current` current tick number
  - `:total` total ticks
  - `:elapsed` time elapsed in seconds
  - `:percent` completion percentage
  - `:eta` estimated completion time in seconds

## Examples

### Download

  In our download example each tick has a variable influence, so we pass the chunk length which adjusts the progress bar appropriately relative to the total length. 

```javascript
var ProgressBar = require('../')
  , https = require('https');

var req = https.request({
    host: 'download.github.com'
  , port: 443
  , path: '/visionmedia-node-jscoverage-0d4608a.zip'
});

req.on('response', function(res){
  var len = parseInt(res.headers['content-length'], 10);

  console.log();
  var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
      complete: '='
    , incomplete: ' '
    , width: 20
    , total: len
  });

  res.on('data', function(chunk){
    bar.tick(chunk.length);
  });

  res.on('end', function(){
    console.log('\n');
  });
});

req.end();
```

  The code above will generate a progress bar that looks like this:

```
downloading [=====             ] 29% 3.7s
```


## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk `&lt;tj@vision-media.ca&gt;`

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