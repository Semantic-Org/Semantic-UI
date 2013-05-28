# Pygments

A pygments wrapper for node.js

## Installation

### Installing npm (node package manager)
```
  curl http://npmjs.org/install.sh | sh
```

### Installing pygments
```
  [sudo] npm install pygments
```

## Usage

### colorize(target, lexer, format, callback, [options]);

* Default lexer is `js`
* Default format is `html`

#### Highlight code

```javascript
var highlight = require('pygments').colorize;

highlight('puts "Hello World"', 'ruby', 'console', function(data) {
  console.log(data);
});
```

#### Highlight a file

```javascript
var highlight = require('pygments').colorize;

highlight('/home/pkumar/package.json', null, 'html', function(data) {
  console.log(data);
});
```

If you want to highlight string `/home/pkumar/package.json` itself,

```javascript
var highlight = require('pygments').colorize;

highlight('/home/pkumar/package.json', null, 'html', function(data) {
  console.log(data);
}, {'force': true});
```

## Run Tests

All of the pygments tests are written in [vows][4], and cover all of the use cases described above.

```
  npm test
```

## License

See LICENSE for details.

## Contact

Pavan Kumar Sunkara

[pavan [dot] sss1991 [at] gmail [dot] com][email]

[email]: mailto:pavan.sss1991@gmail.com
[4]: http://vowsjs.org
