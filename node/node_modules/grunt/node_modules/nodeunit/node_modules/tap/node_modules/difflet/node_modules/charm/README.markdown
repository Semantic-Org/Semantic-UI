charm
=====

Use
[ansi terminal characters](http://www.termsys.demon.co.uk/vtansi.htm)
to write colors and cursor positions.

![me lucky charms](http://substack.net/images/charms.png)

example
=======

lucky
-----

````javascript
var charm = require('charm')(process);
charm.reset();

var colors = [ 'red', 'cyan', 'yellow', 'green', 'blue' ];
var text = 'Always after me lucky charms.';

var offset = 0;
var iv = setInterval(function () {
    var y = 0, dy = 1;
    for (var i = 0; i < 40; i++) {
        var color = colors[(i + offset) % colors.length];
        var c = text[(i + offset) % text.length];
        charm
            .move(1, dy)
            .foreground(color)
            .write(c)
        ;
        y += dy;
        if (y <= 0 || y >= 5) dy *= -1;
    }
    charm.position(0, 1);
    offset ++;
}, 150);
 
charm.on('data', function (buf) {
    if (buf[0] === 3) {
        clearInterval(iv);
        charm.destroy();
    }
});
````

events
======

Charm objects pass along the data events from their input stream except for
events generated from querying the terminal device.

Because charm puts stdin into raw mode, charm emits two special events: "^C" and
"^D" when the user types those combos. It's super convenient with these events
to do:

````javascript
charm.on('^C', process.exit)
````

methods
=======

var charm = require('charm')(param or stream, ...)
--------------------------------------------------

Create a new `charm` given a `param` with `stdout` and `stdin` streams, such as
`process` or by passing the streams in themselves separately as parameters.

Protip: you can pass in an http response object as an output stream and it will
just work™.

charm.reset()
-------------

Reset the entire screen, like the /usr/bin/reset command.

charm.destroy()
---------------

Destroy the input stream.

charm.write(msg)
----------------

Pass along `msg` to the output stream.

charm.position(x, y) or charm.position(cb)
------------------------------------------

Set the cursor position to the absolute coordinates `x, y` or query the position
and get the response as `cb(x, y)`.

charm.move(x, y)
----------------

Move the cursor position by the relative coordinates `x, y`.

charm.up(y)
-----------

Move the cursor up by `y` rows.

charm.down(y)
-------------

Move the cursor down by `y` rows.

charm.left(x)
-------------

Move the cursor left by `x` columns.

charm.right(x)
-------------

Move the cursor right by `x` columns.

charm.push(withAttributes=false)
--------------------------------

Push the cursor state and optionally the attribute state.

charm.pop(withAttributes=false)
-------------------------------

Pop the cursor state and optionally the attribute state.

charm.erase(s)
--------------

Erase a region defined by the string `s`.

`s` can be:

* end - erase from the cursor to the end of the line
* start - erase from the cursor to the start of the line
* line - erase the current line
* down - erase everything below the current line
* up - erase everything above the current line
* screen - erase the entire screen

charm.display(attr)
-------------------

Set the display mode with the string `attr`.

`attr` can be:

* reset
* bright
* dim
* underscore
* blink
* reverse
* hidden

charm.foreground(color)
-----------------------

Set the foreground color with the string `color`, which can be:

* red
* yellow
* green
* blue
* cyan
* magenta
* black
* white

or `color` can be an integer from 0 to 255, inclusive.

charm.background(color)
-----------------------

Set the background color with the string `color`, which can be:

* red
* yellow
* green
* blue
* cyan
* magenta
* black
* white

or `color` can be an integer from 0 to 255, inclusive.

charm.cursor(visible)
---------------------

Set the cursor visibility with a boolean `visible`.

install
=======

With [npm](http://npmjs.org) do:

    npm install charm
