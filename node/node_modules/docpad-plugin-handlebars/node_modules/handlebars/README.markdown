[![Build Status](https://travis-ci.org/wycats/handlebars.js.png?branch=master)](https://travis-ci.org/wycats/handlebars.js)

Handlebars.js
=============

Handlebars.js is an extension to the [Mustache templating language](http://mustache.github.com/) created by Chris Wanstrath. Handlebars.js and Mustache are both logicless templating languages that keep the view and the code separated like we all know they should be.

Checkout the official Handlebars docs site at [http://www.handlebarsjs.com](http://www.handlebarsjs.com).


Installing
----------
Installing Handlebars is easy. Simply [download the package from GitHub](https://github.com/wycats/handlebars.js/archives/master) and add it to your web pages (you should usually use the most recent version).

Usage
-----
In general, the syntax of Handlebars.js templates is a superset of Mustache templates. For basic syntax, check out the [Mustache manpage](http://mustache.github.com/mustache.5.html).

Once you have a template, use the Handlebars.compile method to compile the template into a function. The generated function takes a context argument, which will be used to render the template.

```js
var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
             "{{kids.length}} kids:</p>" +
             "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
var template = Handlebars.compile(source);

var data = { "name": "Alan", "hometown": "Somewhere, TX",
             "kids": [{"name": "Jimmy", "age": "12"}, {"name": "Sally", "age": "4"}]};
var result = template(data);

// Would render:
// <p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
// <ul>
//   <li>Jimmy is 12</li>
//   <li>Sally is 4</li>
// </ul>
```


Registering Helpers
-------------------

You can register helpers that Handlebars will use when evaluating your
template. Here's an example, which assumes that your objects have a URL
embedded in them, as well as the text for a link:

```js
Handlebars.registerHelper('link_to', function(context) {
  return "<a href='" + context.url + "'>" + context.body + "</a>";
});

var context = { posts: [{url: "/hello-world", body: "Hello World!"}] };
var source = "<ul>{{#posts}}<li>{{{link_to this}}}</li>{{/posts}}</ul>"

var template = Handlebars.compile(source);
template(context);

// Would render:
//
// <ul>
//   <li><a href='/hello-world'>Hello World!</a></li>
// </ul>
```

Escaping
--------

By default, the `{{expression}}` syntax will escape its contents. This
helps to protect you against accidental XSS problems caused by malicious
data passed from the server as JSON.

To explicitly *not* escape the contents, use the triple-mustache
(`{{{}}}`). You have seen this used in the above example.


Differences Between Handlebars.js and Mustache
----------------------------------------------
Handlebars.js adds a couple of additional features to make writing templates easier and also changes a tiny detail of how partials work.

### Paths

Handlebars.js supports an extended expression syntax that we call paths. Paths are made up of typical expressions and . characters. Expressions allow you to not only display data from the current context, but to display data from contexts that are descendents and ancestors of the current context.

To display data from descendent contexts, use the `.` character. So, for example, if your data were structured like:

```js
var data = {"person": { "name": "Alan" }, company: {"name": "Rad, Inc." } };
```

you could display the person's name from the top-level context with the following expression:

```
{{person.name}}
```

You can backtrack using `../`. For example, if you've already traversed into the person object you could still display the company's name with an expression like `{{../company.name}}`, so:

```
{{#person}}{{name}} - {{../company.name}}{{/person}}
```

would render:

```
Alan - Rad, Inc.
```

### Strings

When calling a helper, you can pass paths or Strings as parameters. For
instance:

```js
Handlebars.registerHelper('link_to', function(title, context) {
  return "<a href='/posts" + context.url + "'>" + title + "!</a>"
});

var context = { posts: [{url: "/hello-world", body: "Hello World!"}] };
var source = '<ul>{{#posts}}<li>{{{link_to "Post" this}}}</li>{{/posts}}</ul>'

var template = Handlebars.compile(source);
template(context);

// Would render:
//
// <ul>
//   <li><a href='/posts/hello-world'>Post!</a></li>
// </ul>
```

When you pass a String as a parameter to a helper, the literal String
gets passed to the helper function.


### Block Helpers

Handlebars.js also adds the ability to define block helpers. Block helpers are functions that can be called from anywhere in the template. Here's an example:

```js
var source = "<ul>{{#people}}<li>{{#link}}{{name}}{{/link}}</li>{{/people}}</ul>";
Handlebars.registerHelper('link', function(options) {
  return '<a href="/people/' + this.id + '">' + options.fn(this) + '</a>';
});
var template = Handlebars.compile(source);

var data = { "people": [
    { "name": "Alan", "id": 1 },
    { "name": "Yehuda", "id": 2 }
  ]};
template(data);

// Should render:
// <ul>
//   <li><a href="/people/1">Alan</a></li>
//   <li><a href="/people/2">Yehuda</a></li>
// </ul>
```

Whenever the block helper is called it is given two parameters, the argument that is passed to the helper, or the current context if no argument is passed and the compiled contents of the block. Inside of the block helper the value of `this` is the current context, wrapped to include a method named `__get__` that helps translate paths into values within the helpers.

### Partials

You can register additional templates as partials, which will be used by
Handlebars when it encounters a partial (`{{> partialName}}`). Partials
can either be String templates or compiled template functions. Here's an
example:

```js
var source = "<ul>{{#people}}<li>{{> link}}</li>{{/people}}</ul>";

Handlebars.registerPartial('link', '<a href="/people/{{id}}">{{name}}</a>')
var template = Handlebars.compile(source);

var data = { "people": [
    { "name": "Alan", "id": 1 },
    { "name": "Yehuda", "id": 2 }
  ]};

template(data);

// Should render:
// <ul>
//   <li><a href="/people/1">Alan</a></li>
//   <li><a href="/people/2">Yehuda</a></li>
// </ul>
```

### Comments

You can add comments to your templates with the following syntax:

```js
{{! This is a comment }}
```

You can also use real html comments if you want them to end up in the output.

```html
<div>
    {{! This comment will not end up in the output }}
    <!-- This comment will show up in the output -->
</div>
```


Precompiling Templates
----------------------

Handlebars allows templates to be precompiled and included as javascript
code rather than the handlebars template allowing for faster startup time.

### Installation
The precompiler script may be installed via npm using the `npm install -g handlebars`
command.

### Usage

<pre>
Precompile handlebar templates.
Usage: handlebars template...

Options:
  -a, --amd        Create an AMD format function (allows loading with RequireJS)         [boolean]
  -f, --output     Output File                                                           [string]
  -k, --known      Known helpers                                                         [string]
  -o, --knownOnly  Known helpers only                                                    [boolean]
  -m, --min        Minimize output                                                       [boolean]
  -s, --simple     Output template function only.                                        [boolean]
  -r, --root       Template root. Base value that will be stripped from template names.  [string]
</pre>

If using the precompiler's normal mode, the resulting templates will be stored
to the `Handlebars.templates` object using the relative template name sans the
extension. These templates may be executed in the same manner as templates.

If using the simple mode the precompiler will generate a single javascript method.
To execute this method it must be passed to the using the `Handlebars.template`
method and the resulting object may be as normal.

### Optimizations

- Rather than using the full _handlebars.js_ library, implementations that
  do not need to compile templates at runtime may include _handlebars.runtime.js_
  whose min+gzip size is approximately 1k.
- If a helper is known to exist in the target environment they may be defined
  using the `--known name` argument may be used to optimize accesses to these
  helpers for size and speed.
- When all helpers are known in advance the `--knownOnly` argument may be used
  to optimize all block helper references.


Performance
-----------

In a rough performance test, precompiled Handlebars.js templates (in the original version of Handlebars.js) rendered in about half the time of Mustache templates. It would be a shame if it were any other way, since they were precompiled, but the difference in architecture does have some big performance advantages. Justin Marney, a.k.a. [gotascii](http://github.com/gotascii), confirmed that with an [independent test](http://sorescode.com/2010/09/12/benchmarks.html). The rewritten Handlebars (current version) is faster than the old version, and we will have some benchmarks in the near future.


Building
--------

To build handlebars, just run `rake release`, and you will get two files
in the `dist` directory.


Upgrading
---------

When upgrading from the Handlebars 0.9 series, be aware that the
signature for passing custom helpers or partials to templates has
changed.

Instead of:

```js
template(context, helpers, partials, [data])
```

Use:

```js
template(context, {helpers: helpers, partials: partials, data: data})
```

Known Issues
------------
* Handlebars.js can be cryptic when there's an error while rendering.
* Using a variable, helper, or partial named `class` causes errors in IE browsers. (Instead, use `className`)

Handlebars in the Wild
-----------------
* [jblotus](http://github.com/jblotus) created [http://tryhandlebarsjs.com](http://tryhandlebarsjs.com) for anyone who would
like to try out Handlebars.js in their browser.
* Don Park wrote an Express.js view engine adapter for Handlebars.js called [hbs](http://github.com/donpark/hbs).
* [sammy.js](http://github.com/quirkey/sammy) by Aaron Quint, a.k.a. quirkey, supports Handlebars.js as one of its template plugins.
* [SproutCore](http://www.sproutcore.com) uses Handlebars.js as its main templating engine, extending it with automatic data binding support.
* [Ember.js](http://www.emberjs.com) makes Handlebars.js the primary way to structure your views, also with automatic data binding support.
* Les Hill (@leshill) wrote a Rails Asset Pipeline gem named [handlebars_assets](http://github.com/leshill/handlebars_assets).

Helping Out
-----------
To build Handlebars.js you'll need a few things installed.

* Node.js
* Jison, for building the compiler - `npm install jison`
* Ruby
* therubyracer, for running tests - `gem install therubyracer`
* rspec, for running tests - `gem install rspec`

There's a Gemfile in the repo, so you can run `bundle` to install rspec and therubyracer if you've got bundler installed.

To build Handlebars.js from scratch, you'll want to run `rake compile` in the root of the project. That will build Handlebars and output the results to the dist/ folder. To run tests, run `rake spec`. You can also run our set of benchmarks with `rake bench`.

If you notice any problems, please report them to the GitHub issue tracker at [http://github.com/wycats/handlebars.js/issues](http://github.com/wycats/handlebars.js/issues). Feel free to contact commondream or wycats through GitHub with any other questions or feature requests. To submit changes fork the project and send a pull request.

License
-------
Handlebars.js is released under the MIT license.
