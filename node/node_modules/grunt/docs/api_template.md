[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# [The grunt API](api.md) / grunt.template

Underscore.js template processing and other template-related methods.

Template strings can be processed manually using the provided template functions. In addition, many tasks and helpers automatically expand `<% %>` style template strings specified inside the [grunt.js gruntfile](getting_started.md) when used as file paths and banners.

See the [template lib source](../lib/grunt/template.js) for more information.

## The template API

### grunt.template.process
Process an [Underscore.js template](http://underscorejs.org/#template) string. If `data` is omitted, the entire [config object](api_config.md) is used. Templates are processed recursively until there are no more templates to process.

Inside templates, the `grunt` object is exposed as `grunt` so that you can do things like `<%= grunt.template.today('yyyy') %>`. _Note that if the `data` object has a `grunt` property, it will prevent this from working._

If `mode` is omitted, `<% %>` style template delimiters will be used. If `mode` is "init", `{% %}` style template delimiters will be used (this is specifically used by the [init task](task_init.md)).

```javascript
grunt.template.process(template, data, mode)
```

In this example, the `baz` property is processed recursively until there are no more `<% %>` templates to process.

```javascript
var obj = {
  foo: 'c',
  bar: 'b<%= foo %>d',
  baz: 'a<%= bar %>e'
};
grunt.template.process('<%= baz %>', obj) // 'abcde'
```

### grunt.template.delimiters
Set [Underscore.js template](http://underscorejs.org/#template) delimiters manually, in case you need to use `grunt.utils._.template` manually. You probably won't need to call this, because you'll be using `grunt.template.process` which calls this internally.

If `mode` is omitted, `<% %>` style template delimiters will be used. If `mode` is "init", `{% %}` style template delimiters will be used (this is specifically used by the [init task](task_init.md)).

```javascript
grunt.template.delimiters(mode)
```

## Template Helpers

### grunt.template.date
Format a date using the [dateformat](https://github.com/felixge/node-dateformat) library.

```javascript
grunt.template.date(date, format)
```

In this example, a specific date is formatted as month/day/year.

```javascript
grunt.template.date(847602000000, 'yyyy-mm-dd') // '1996-11-10'
```

### grunt.template.today
Format today's date using the [dateformat](https://github.com/felixge/node-dateformat) library.

```javascript
grunt.template.today(format)
```

In this example, today's date is formatted as a 4-digit year.

```javascript
grunt.template.today('yyyy') // '2012'
```

_(somebody remind me to update this date every year so the docs appear current)_
