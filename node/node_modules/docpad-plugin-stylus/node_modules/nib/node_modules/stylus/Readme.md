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

  - [css syntax](/LearnBoost/stylus/blob/master/docs/css-style.md) support
  - [mixins](/LearnBoost/stylus/blob/master/docs/mixins.md)
  - [keyword arguments](/LearnBoost/stylus/blob/master/docs/kwargs.md)
  - [variables](/LearnBoost/stylus/blob/master/docs/variables.md)
  - [interpolation](/LearnBoost/stylus/blob/master/docs/interpolation.md)
  - arithmetic, logical, and equality [operators](/LearnBoost/stylus/blob/master/docs/operators.md)
  - [importing](/LearnBoost/stylus/blob/master/docs/import.md) of other stylus sheets
  - [introspection api](/LearnBoost/stylus/blob/master/docs/introspection.md)
  - type coercion
  - [@extend](/LearnBoost/stylus/blob/master/docs/extend.md)
  - [conditionals](/LearnBoost/stylus/blob/master/docs/conditionals.md)
  - [iteration](/LearnBoost/stylus/blob/master/docs/iteration.md)
  - nested [selectors](/LearnBoost/stylus/blob/master/docs/selectors.md)
  - parent reference
  - in-language [functions](/LearnBoost/stylus/blob/master/docs/functions.md)
  - [variable arguments](/LearnBoost/stylus/blob/master/docs/vargs.md)
  - built-in [functions](/LearnBoost/stylus/blob/master/docs/bifs.md) (over 25)
  - optional [image inlining](/LearnBoost/stylus/blob/master/docs/functions.url.md)
  - optional compression
  - JavaScript [API](/LearnBoost/stylus/blob/master/docs/js.md)
  - extremely terse syntax
  - stylus [executable](/LearnBoost/stylus/blob/master/docs/executable.md)
  - [error reporting](/LearnBoost/stylus/blob/master/docs/error-reporting.md)
  - single-line and multi-line [comments](/LearnBoost/stylus/blob/master/docs/comments.md)
  - css [literal](/LearnBoost/stylus/blob/master/docs/literal.md)
  - character [escaping](/LearnBoost/stylus/blob/master/docs/escape.md)
  - [@keyframes](/LearnBoost/stylus/blob/master/docs/keyframes.md) support & expansion
  - [@font-face](/LearnBoost/stylus/blob/master/docs/font-face.md) support
  - [@media](/LearnBoost/stylus/blob/master/docs/media.md) support
  - Connect [Middleware](/LearnBoost/stylus/blob/master/docs/middleware.md)
  - TextMate [bundle](/LearnBoost/stylus/blob/master/docs/textmate.md)
  - Coda/SubEtha Edit [Syntax mode](https://github.com/atljeremy/Stylus.mode)
  - gedit [language-spec](/LearnBoost/stylus/blob/master/docs/gedit.md)
  - VIM [Syntax](https://github.com/wavded/vim-stylus)
  - [Firebug extension](/LearnBoost/stylus/blob/master/docs/firebug.md)
  - heroku [web service](http://styl.heroku.com) for compiling stylus
  - transparent vendor-specific function expansion

### Framework Support

   - [Connect](/LearnBoost/stylus/blob/master/docs/middleware.md)
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

  - Language [comparisons](/LearnBoost/stylus/blob/master/docs/compare.md)

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
