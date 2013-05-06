# grunt-css

[Grunt](https://github.com/cowboy/grunt) plugin for linting and minifying CSS

## Getting Started

Install the module with:

	npm install grunt-css --save-dev

Then load it from your own `Gruntfile.js` file:

```js
grunt.loadNpmTasks('grunt-css');
```

### grunt 0.3 compability

If you're using grunt 0.3, install the 0.1.0 version of this task:

	npm install grunt-css@0.3.2

## Documentation

This plugin provides two tasks: `cssmin` and `csslint`. Both area [multi tasks][types_of_tasks], meaning that grunt will automatically iterate over all `cssmin` and `csslint` targets if a target is not specified.

[types_of_tasks]: https://github.com/cowboy/grunt/blob/master/docs/types_of_tasks.md

### cssmin

This works similar to the [`uglify` task](https://github.com/gruntjs/grunt-contrib-uglify). Specify a src and dest property for input and output:

```js
// Project configuration.
grunt.initConfig({
	cssmin: {
		my_target: {
			src: 'src/input.css',
			dest: 'dist/output.min.css'
		}
	}
});
```

Exposes option of clean-css, which you can set per target or for all, as usual:
keepSpecialComments

```js
// Project configuration.
grunt.initConfig({
	cssmin: {
		options: {
			keepSpecialComments: 0
		},
		my_target: {
			options: {
				keepSpecialComments: 1
			},
			src: 'src/input.css',
			dest: 'dist/output.min.css'
		}
	}
});
```

#### Banner comments

In this example, running `grunt cssmin:my_target` will prepend a banner created by interpolating the `banner` template string with the config object. Here, those properties are the values imported from the `package.json` file (which are available via the `pkg` config property) plus today's date.


```js
// Project configuration.
grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	cssmin: {
		options: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %> */'
		},
		my_target: {
			files: {
				src: 'src/input.css',
				dest: 'dist/output.min.css'
			}
		}
	}
});
```


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
	overqualified-elements
	display-property-grouping
	bulletproof-font-face
	compatible-vendor-prefixes
	regex-selectors
	errors
	duplicate-background-images
	duplicate-properties
	empty-rules
	selector-max-approaching
	gradients
	fallback-colors
	font-sizes
	font-faces
	floats
	star-property-hack
	outline-none
	import
	ids
	underscore-property-hack
	rules-count
	qualified-headings
	selector-max
	shorthand
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
