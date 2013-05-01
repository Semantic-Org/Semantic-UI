Welcome to Sqwish
----------
A [Node](http://nodejs.org) based CSS Compressor. It works like this.

    require('sqwish').minify('body { color: #ff33cc; }');
    // =>
    body{color:#f3c}

CLI
---
Install it.

    $ npm install sqwish

Use it like this:

    $ sqwish app.css # default output is <file>.min.css therefore app.css => app.min.css
    $ # or...
    $ sqwish css/styles.css -o prod/something-else.min.css

Notes
-------
Sqwish does not attempt to fix invalid CSS, therefore, at minimum, your CSS should at least follow the basic rules:

    selectors[,more selectors] {
      property: value;
      another-property: another value;
    }

Strict Optimizations
----------
Aside from regular minification, in <code>--strict</code> mode Sqwish will combine duplicate selectors and merge duplicate properties.

``` css
/* before */
div {
  color: orange;
  background: red;
}
div {
  color: #ff33cc;
  margin: 1px 0px 1px 0px;
}

/* after */
div{color:#f3c;background:red;margin:1px 0}
```

This mode can be enabled as so:

    sqwish.minify(css, true);

on the command line

    $ sqwish styles.css --strict

Developers
----------
Be sure you have the proper testing harness set up ahead of time by installing the <code>sink-test</code> submodule

    $ npm install --dev

Tests can be added in <code>tests/tests.js</code>, and then run as such:

    $ npm test

License
-------
Sqwish is copyright Dustin Diaz 2011 under MIT License

**Happy Sqwishing!**