match-stream [![Build Status](https://travis-ci.org/EvanOxfeld/match-stream.png)](https://travis-ci.org/EvanOxfeld/match-stream)
============

Supply a function to handle pattern matches within a NodeJS stream.

## Installation

```bash
$ npm install match-stream
```

## Quick Examples

### End stream on match

```javascript
var MatchStream = require('match-stream');
var streamBuffers = require("stream-buffers");

var ms = new MatchStream({ pattern: 'World'}, function (buf, matched, extra) {
  if (!matched) {
    return this.push(buf);
  }
  this.push(buf);
  return this.push(null); //end the stream
});

var sourceStream = new streamBuffers.ReadableStreamBuffer();
sourceStream.put("Hello World");
var writableStream = new streamBuffers.WritableStreamBuffer();

sourceStream
  .pipe(ms)
  .pipe(writableStream)
  .once('close', function () {
    var str = writableStream.getContentsAsString('utf8');
    console.log('Piped data before pattern occurs:', "'" + str + "'");
    sourceStream.destroy();
  });

//Output
//Piped data before pattern occurs: 'Hello '
```

### Split stream

```javascript
var MatchStream = require('match-stream');
var fs = require('fs');

var line = "";
var loremLines = [];
var ms = new MatchStream({ pattern: '.', consume: true}, function (buf, matched, extra) {
  line += buf.toString();
  if (matched) {
    loremLines.push(line.trim());
    line = "";
  }
});

fs.createReadStream('lorem.txt')
  .pipe(ms)
  .once('end', function() {
    console.log(loremLines);
  });
```

## License

MIT

## Acknowledgements

Special thanks to @wanderview for assisting with the API.

