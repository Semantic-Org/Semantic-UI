# grunt-css

[Grunt](https://github.com/cowboy/grunt) plugin for linting and minifying CSS

## Getting Started

Install the module with: `npm install grunt-css`

Then load it from your own `grunt.js` file:

```js
grunt.loadNpmTasks('grunt-css');
```

## Documentation

This plugin provides two tasks: `cssmin` and `csslint`. Both area [multi tasks][types_of_tasks], meaning that grunt will automatically iterate over all `cssmin` and `csslint` targets if a target is not specified.

[types_of_tasks]: https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md

### cssmin

This works just like the [built-in `min` task, so check docs for that](https://github.com/cowboy/grunt/blob/master/docs/task_min.md).

### csslint

This is similar to the built-in lint task, though the configuration is different. Here's an example:

```js
csslint: {
	base_theme: {
		src: "themes/base/*.css",
		rules: {
			"import": false,
			"overqualified-elements": 2
		}
	}
}
```

`src` specifies the files to lint, `rules` the rules to apply. A value of `false` ignores the rule, a value of `2` will set it to become an error. Otherwise all rules are considered warnings.

For the current csslint version, these rules are available:

	important
	adjoining-classes
	known-properties
	box-sizing
	box-model
	outline-none
	duplicate-background-images
	compatible-vendor-prefixes
	display-property-grouping
	qualified-headings
	fallback-colors
	duplicate-properties
	empty-rules
	errors
	shorthand
	ids
	gradients
	font-sizes
	font-faces
	floats
	underscore-property-hack
	overqualified-elements
	import
	regex-selectors
	rules-count
	star-property-hack
	text-indent
	unique-headings
	universal-selector
	unqualified-attributes
	vendor-prefix
	zero-units

For an explanation of those rules, [check the csslint wiki](https://github.com/stubbornella/csslint/wiki/Rules).

*Side note: To update this list, run this:*

```bash
node -e "require('csslint').CSSLint.getRules().forEach(function(x) { console.log(x.id) })"
```

## Contributing

Please use the issue tracker and pull requests.

## License
Copyright (c) 2012 Jörn Zaefferer
Licensed under the MIT license.
