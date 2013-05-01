# Underscore.string [![Build Status](https://secure.travis-ci.org/epeli/underscore.string.png?branch=master)](http://travis-ci.org/epeli/underscore.string) #



Javascript lacks complete string manipulation operations.
This an attempt to fill that gap. List of build-in methods can be found
for example from [Dive Into JavaScript][d].

[d]: http://www.diveintojavascript.com/core-javascript-reference/the-string-object


As name states this an extension for [Underscore.js][u], but it can be used
independently from **_s**-global variable. But with Underscore.js you can
use Object-Oriented style and chaining:

[u]: http://documentcloud.github.com/underscore/

```javascript
_("   epeli  ").chain().trim().capitalize().value()
=> "Epeli"
```

## Download ##

  * [Development version](https://raw.github.com/epeli/underscore.string/master/lib/underscore.string.js) *Uncompressed with Comments 18kb*
  * [Production version](https://github.com/epeli/underscore.string/raw/master/dist/underscore.string.min.js) *Minified 7kb*


## Node.js installation ##

**npm package**

    npm install underscore.string

**Standalone usage**:

```javascript
var _s = require('underscore.string');
```

**Integrate with Underscore.js**:

```javascript
var _  = require('underscore');

// Import Underscore.string to separate object, because there are conflict functions (include, reverse, contains)
_.str = require('underscore.string');

// Mix in non-conflict functions to Underscore namespace if you want
_.mixin(_.str.exports());

// All functions, include conflict, will be available through _.str object
_.str.include('Underscore.string', 'string'); // => true
```

## String Functions ##

For availability of functions in this way you need to mix in Underscore.string functions:

```javascript
_.mixin(_.string.exports());
```

otherwise functions from examples will be available through _.string or _.str objects:

```javascript
_.str.capitalize('epeli')
=> "Epeli"
```

**capitalize** _.capitalize(string)

Converts first letter of the string to uppercase and the rest of the string to lower case.

```javascript
_.capitalize("foo Bar")
=> "Foo bar"
```

**chop** _.chop(string, step)

```javascript
_.chop('whitespace', 3)
=> ['whi','tes','pac','e']
```

**clean** _.clean(str)

Compress some whitespaces to one.

```javascript
_.clean(" foo    bar   ")
=> 'foo bar'
```

**chars** _.chars(str)

```javascript
_.chars('Hello')
=> ['H','e','l','l','o']
```

**includes** _.includes(string, substring)

Tests if string contains a substring.

```javascript
_.includes("foobar", "ob")
=> true
```

**include** available only through _.str object, because Underscore has function with the same name.

```javascript
_.str.include("foobar", "ob")
=> true
```

**includes** function was removed

But you can create it in this way, for compatibility with previous versions:

```javascript
_.includes = _.str.include
```

**count** _.count(string, substring)

```javascript
_('Hello world').count('l')
=> 3
```

**escapeHTML** _.escapeHTML(string)

Converts HTML special characters to their entity equivalents.

```javascript
_('<div>Blah blah blah</div>').escapeHTML();
=> '&lt;div&gt;Blah blah blah&lt;/div&gt;'
```

**unescapeHTML** _.unescapeHTML(string)

Converts entity characters to HTML equivalents.

```javascript
_('&lt;div&gt;Blah blah blah&lt;/div&gt;').unescapeHTML();
=> '<div>Blah blah blah</div>'
```

**insert** _.insert(string, index, substing)

```javascript
_('Hello ').insert(6, 'world')
=> 'Hello world'
```

**isBlank** _.isBlank(string)

```javascript
_('').isBlank(); // => true
_('\n').isBlank(); // => true
_(' ').isBlank(); // => true
_('a').isBlank(); // => false
```

**join** _.join(separator, *strings)

Joins strings together with given separator

```javascript
_.join(" ", "foo", "bar")
=> "foo bar"
```

**lines** _.lines(str)

```javascript
_.lines("Hello\nWorld")
=> ["Hello", "World"]
```

**reverse** available only through _.str object, because Underscore has function with the same name.

Return reversed string:

```javascript
_.str.reverse("foobar")
=> 'raboof'
```

**splice**  _.splice(string, index, howmany, substring)

Like a array splice.

```javascript
_('https://edtsech@bitbucket.org/edtsech/underscore.strings').splice(30, 7, 'epeli')
=> 'https://edtsech@bitbucket.org/epeli/underscore.strings'
```

**startsWith** _.startsWith(string, starts)

This method checks whether string starts with starts.

```javascript
_("image.gif").startsWith("image")
=> true
```

**endsWith** _.endsWith(string, ends)

This method checks whether string ends with ends.

```javascript
_("image.gif").endsWith("gif")
=> true
```

**succ**  _.succ(str)

Returns the successor to str.

```javascript
_('a').succ()
=> 'b'

_('A').succ()
=> 'B'
```

**supplant**

Supplant function was removed, use Underscore.js [template function][p].

[p]: http://documentcloud.github.com/underscore/#template

**strip** alias for *trim*

**lstrip** alias for *ltrim*

**rstrip** alias for *rtrim*

**titleize** _.titleize(string)

```javascript
_('my name is epeli').titleize()
=> 'My Name Is Epeli'
```

**camelize** _.camelize(string)

Converts underscored or dasherized string to a camelized one

```javascript
_('-moz-transform').camelize()
=> 'MozTransform'
```

**classify** _.classify(string)

Converts string to camelized class name

```javascript
_('some_class_name').classify()
=> 'SomeClassName'
```

**underscored** _.underscored(string)

Converts a camelized or dasherized string into an underscored one

```javascript
_('MozTransform').underscored()
=> 'moz_transform'
```

**dasherize** _.dasherize(string)

Converts a underscored or camelized string into an dasherized one

```javascript
_('MozTransform').dasherize()
=> '-moz-transform'
```

**humanize** _.humanize(string)

Converts an underscored, camelized, or dasherized string into a humanized one.
Also removes beginning and ending whitespace, and removes the postfix '_id'.

```javascript
_('  capitalize dash-CamelCase_underscore trim  ').humanize()
=> 'Capitalize dash camel case underscore trim'
```

**trim** _.trim(string, [characters])

trims defined characters from begining and ending of the string.
Defaults to whitespace characters.

```javascript
_.trim("  foobar   ")
=> "foobar"

_.trim("_-foobar-_", "_-")
=> "foobar"
```


**ltrim** _.ltrim(string, [characters])

Left trim. Similar to trim, but only for left side.


**rtrim** _.rtrim(string, [characters])

Right trim. Similar to trim, but only for right side.

**truncate** _.truncate(string, length, truncateString)

```javascript
_('Hello world').truncate(5)
=> 'Hello...'

_('Hello').truncate(10)
=> 'Hello'
```

**prune** _.prune(string, length, pruneString)

Elegant version of truncate.
Makes sure the pruned string does not exceed the original length.
Avoid half-chopped words when truncating.

```javascript
_('Hello, world').prune(5)
=> 'Hello...'

_('Hello, world').prune(8)
=> 'Hello...'

_('Hello, world').prune(5, ' (read a lot more)')
=> 'Hello, world' (as adding "(read a lot more)" would be longer than the original string)

_('Hello, cruel world').prune(15)
=> 'Hello, cruel...'

_('Hello').prune(10)
=> 'Hello'
```

**words** _.words(str, delimiter=" ")

Split string by delimiter (String or RegExp), ' ' by default.

```javascript
_.words("I love you")
=> ["I","love","you"]

_.words("I_love_you", "_")
=> ["I","love","you"]

_.words("I-love-you", /-/)
=> ["I","love","you"]
```

**sprintf** _.sprintf(string format, *arguments)

C like string formatting.
Credits goes to [Alexandru Marasteanu][o].
For more detailed documentation, see the [original page][o].

[o]: http://www.diveintojavascript.com/projects/sprintf-for-javascript

```javascript
_.sprintf("%.1f", 1.17)
"1.2"
```

**pad** _.pad(str, length, [padStr, type])

pads the `str` with characters until the total string length is equal to the passed `length` parameter. By default, pads on the **left** with the space char (`" "`). `padStr` is truncated to a single character if necessary.

```javascript
_.pad("1", 8)
-> "       1";

_.pad("1", 8, '0')
-> "00000001";

_.pad("1", 8, '0', 'right')
-> "10000000";

_.pad("1", 8, '0', 'both')
-> "00001000";

_.pad("1", 8, 'bleepblorp', 'both')
-> "bbbb1bbb";
```

**lpad** _.lpad(str, length, [padStr])

left-pad a string. Alias for `pad(str, length, padStr, 'left')`

```javascript
_.lpad("1", 8, '0')
-> "00000001";
```

**rpad** _.rpad(str, length, [padStr])

right-pad a string. Alias for `pad(str, length, padStr, 'right')`

```javascript
_.rpad("1", 8, '0')
-> "10000000";
```

**lrpad** _.lrpad(str, length, [padStr])

left/right-pad a string. Alias for `pad(str, length, padStr, 'both')`

```javascript
_.lrpad("1", 8, '0')
-> "00001000";
```

**center** alias for **lrpad**

**ljust** alias for *rpad*

**rjust** alias for *lpad*

**toNumber**  _.toNumber(string, [decimals])

Parse string to number. Returns NaN if string can't be parsed to number.

```javascript
_('2.556').toNumber()
=> 3

_('2.556').toNumber(1)
=> 2.6
```

**strRight**  _.strRight(string, pattern)

Searches a string from left to right for a pattern and returns a substring consisting of the characters in the string that are to the right of the pattern or all string if no match found.

```javascript
_('This_is_a_test_string').strRight('_')
=> "is_a_test_string";
```

**strRightBack**  _.strRightBack(string, pattern)

Searches a string from right to left for a pattern and returns a substring consisting of the characters in the string that are to the right of the pattern or all string if no match found.

```javascript
_('This_is_a_test_string').strRightBack('_')
=> "string";
```

**strLeft**  _.strLeft(string, pattern)

Searches a string from left to right for a pattern and returns a substring consisting of the characters in the string that are to the left of the pattern or all string if no match found.

```javascript
_('This_is_a_test_string').strLeft('_')
=> "This";
```

**strLeftBack**  _.strLeftBack(string, pattern)

Searches a string from right to left for a pattern and returns a substring consisting of the characters in the string that are to the left of the pattern or all string if no match found.

```javascript
_('This_is_a_test_string').strLeftBack('_')
=> "This_is_a_test";
```

**stripTags**

Removes all html tags from string.

```javascript
_('a <a href="#">link</a>').stripTags()
=> 'a link'

_('a <a href="#">link</a><script>alert("hello world!")</script>').stripTags()
=> 'a linkalert("hello world!")'
```

**toSentence**  _.toSentence(array, [delimiter, lastDelimiter])

Join an array into a human readable sentence.

```javascript
_.toSentence(['jQuery', 'Mootools', 'Prototype'])
=> 'jQuery, Mootools and Prototype';

_.toSentence(['jQuery', 'Mootools', 'Prototype'], ', ', ' unt ')
=> 'jQuery, Mootools unt Prototype';
```

**repeat** _.repeat(string, count, [separator])

Repeats a string count times.

```javascript
_.repeat("foo", 3)
=> 'foofoofoo';

_.repeat("foo", 3, "bar")
=> 'foobarfoobarfoo'
```

**slugify** _.slugify(string)

Transform text into a URL slug. Replaces whitespaces, accentuated, and special characters with a dash.

```javascript
_.slugify("Un éléphant à l'orée du bois")
=> 'un-elephant-a-loree-du-bois';
```

***Caution: this function is charset dependent***

## Roadmap ##

Any suggestions or bug reports are welcome. Just email me or more preferably open an issue.

## Changelog ##

### 2.0.0 ###

* Added prune, humanize functions
* Added _.string (_.str) namespace for Underscore.string library
* Removed includes function

#### Problems

We lose two things for `include` and `reverse` methods from `_.string`:

* Calls like `_('foobar').include('bar')` aren't available;
* Chaining isn't available too.

But if you need this functionality you can create aliases for conflict functions which will be convenient for you:

```javascript
_.mixin({
    includeString: _.str.include,
    reverseString: _.str.reverse
})

// Now wrapper calls and chaining are available.
_('foobar').chain().reverseString().includeString('rab').value()
```

#### Standalone Usage

If you are using Underscore.string without Underscore. You also have `_.string` namespace for it and `_.str` alias
But of course you can just reassign `_` variable with `_.string`

```javascript
_ = _.string
```
### 2.1.1###

* Fixed words method bug
* Added classify method

### 2.1.0 ###

* AMD support
* Added toSentence method
* Added slugify method
* Lots of speed optimizations

### 2.0.0 ###

For upgrading to this version you need to mix in Underscore.string library to Underscore object:

```javascript
_.mixin(_.string.exports());
```

and all non-conflict Underscore.string functions will be available through Underscore object.
Also function `includes` has been removed, you should replace this function by `_.str.include`
or create alias `_.includes = _.str.include` and all your code will work fine.

### 1.1.6 ###

* Fixed reverse and truncate
* Added isBlank, stripTags, inlude(alias for includes)
* Added uglifier compression

### 1.1.5 ###

* Added strRight, strRightBack, strLeft, strLeftBack

### 1.1.4 ###

* Added pad, lpad, rpad, lrpad methods and aliases center, ljust, rjust
* Integration with Underscore 1.1.6

### 1.1.3 ###

* Added methods: underscored, camelize, dasherize
* Support newer version of npm

### 1.1.2 ###

* Created functions: lines, chars, words functions

### 1.0.2 ###

* Created integration test suite with underscore.js 1.1.4 (now it's absolutely compatible)
* Removed 'reverse' function, because this function override underscore.js 'reverse'

## Contribute ##

* Fork & pull request. Don't forget about tests.
* If you planning add some feature please create issue before.

Otherwise changes will be rejected.

## Contributors list ##

*  Esa-Matti Suuronen <esa-matti@suuronen.org> (<http://esa-matti.suuronen.org/>),
*  Edward Tsech <edtsech@gmail.com>,
*  Sasha Koss <kossnocorp@gmail.com> (<http://koss.nocorp.me/>),
*  Vladimir Dronnikov <dronnikov@gmail.com>,
*  Pete Kruckenberg (<https://github.com/kruckenb>),
*  Paul Chavard <paul@chavard.net> (<http://tchak.net>),
*  Ed Finkler <coj@funkatron.com> (<http://funkatron.com>)
*  Pavel Pravosud <rwz@duckroll.ru>
*  Anton Lindqvist <anton@qvister.se> (<http://qvister.se>)

## Licence ##

The MIT License

Copyright (c) 2011 Esa-Matti Suuronen esa-matti@suuronen.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
