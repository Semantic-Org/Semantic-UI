
# css

  CSS parser / stringifier using [css-parse](https://github.com/visionmedia/css-parse) and [css-stringify](https://github.com/visionmedia/css-stringify).

## Installation

    $ npm install css

## Example

js:

```js
var css = require('css')
var obj = css.parse('tobi { name: "tobi" }')
css.stringify(obj);
```

object returned by `.parse()`:

```json
{
  "stylesheet": {
    "rules": [
      {
        "selector": "tobi",
        "declarations": [
          {
            "property": "name",
            "value": "tobi"
          }
        ]
      }
    ]
  }
}
```

string returned by `.stringify(ast)`:

```css
tobi {
  name: tobi;
}
```

string returned by `.stringify(ast, { compress: true })`:

```css
tobi{name:tobi}
```

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

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