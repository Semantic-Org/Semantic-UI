# Stylus

 Stylus is a revolutionary new language, providing an efficient, dynamic, and expressive way to generate CSS. Supporting both an indented syntax and regular CSS style.

## Installation

```bash
$ npm install stylus
```

### Example

```
border-radius()
  -webkit-border-radius: arguments
  -moz-border-radius: arguments
  border-radius: arguments

body a
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif
  background: black
  color: #ccc

form input
  padding: 5px
  border: 1px solid
  border-radius: 5px
```

compiles to:

```css
body a {
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
  background: #000;
  color: #ccc;
}
form input {
  padding: 5px;
  border: 1px solid;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  border-radius: 5px;
}
```

the following is equivalent to the indented version of Stylus source, using the CSS syntax instead:

```
border-radius() {
  -webkit-border-radius: arguments
  -moz-border-radius: arguments
  border-radius: arguments
}

body a {
  font: 12px/1.4 "Lucida Grande", Arial, sans-serif;
  background: black;
  color: #ccc;
}

form input {
  padding: 5px;
  border: 1px solid;
  border-radius: 5px;
}
```

### Features

 Stylus has _many_ features.  Detailed documentation links follow:

  - [css syntax](docs/css-style.md) support
  - [mixins](docs/mixins.md)
  - [keyword arguments](docs/kwargs.md)
  - [variables](docs/variables.md)
  - [interpolation](docs/interpolation.md)
  - arithmetic, logical, and equality [operators](docs/operators.md)
  - [importing](docs/import.md) of other stylus sheets
  - [introspection api](docs/introspection.md)
  - type coercion
  - [@extend](docs/extend.md)
  - [conditionals](docs/conditionals.md)
  - [iteration](docs/iteration.md)
  - nested [selectors](docs/selectors.md)
  - parent reference
  - in-language [functions](docs/functions.md)
  - [variable arguments](docs/vargs.md)
  - built-in [functions](docs/bifs.md) (over 25)
  - optional [image inlining](docs/functions.url.md)
  - optional compression
  - JavaScript [API](docs/js.md)
  - extremely terse syntax
  - stylus [executable](docs/executable.md)
  - [error reporting](docs/error-reporting.md)
  - single-line and multi-line [comments](docs/comments.md)
  - css [literal](docs/literal.md)
  - character [escaping](docs/escape.md)
  - [@keyframes](docs/keyframes.md) support & expansion
  - [@font-face](docs/font-face.md) support
  - [@media](docs/media.md) support
  - Connect [Middleware](docs/middleware.md)
  - TextMate [bundle](docs/textmate.md)
  - Coda/SubEtha Edit [Syntax mode](https://github.com/atljeremy/Stylus.mode)
  - gedit [language-spec](docs/gedit.md)
  - VIM [Syntax](https://github.com/wavded/vim-stylus)
  - [Firebug extension](docs/firebug.md)
  - heroku [web service](http://styl.heroku.com) for compiling stylus
  - [style guide](https://github.com/lepture/ganam) parser and generator
  - transparent vendor-specific function expansion

### Framework Support

   - [Connect](docs/middleware.md)
   - [Play! 2.0](https://github.com/patiencelabs/play-stylus)
   - [Ruby On Rails](https://github.com/lucasmazza/ruby-stylus)

### CMS Support

   - [DocPad](https://github.com/bevry/docpad)
   - [Punch](https://github.com/laktek/punch-stylus-compiler)

### Screencasts

  - [Stylus Intro](http://screenr.com/bNY)
  - [CSS Syntax & Postfix Conditionals](http://screenr.com/A8v)

### Authors

  - [TJ Holowaychuk (visionmedia)](http://github.com/visionmedia)

### More Information

  - Language [comparisons](docs/compare.md)

## License 

(The MIT License)

Copyright (c) 2010 LearnBoost &lt;dev@learnboost.com&gt;

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
