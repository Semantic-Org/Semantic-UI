# Handlebars Plugin for DocPad
Adds support for the [Handlebars](http://handlebarsjs.com/) templating engine to [DocPad](https://docpad.org)

Convention:  `.inlinejs|js|anything.handlebars|hbs|hb`


## Install

```
npm install --save docpad-plugin-handlebars
```


## Configuration

### Getting helpers and partials to work

For the plugin to support helpers and partials, you'll have to add something like the following to your [docpad configuration file](http://docpad.org/docs/config) manually:

``` coffee
# ...
plugins:
	handlebars:
		helpers:
			# Expose docpads 'getBlock' function to handlebars
			getBlock: (type, additional...) ->
				additional.pop() # remove the hash object
				@getBlock(type).add(additional).toHTML()
		partials:
			title: '<h1>{{document.title}}</h1>'
			goUp: '<a href="#">Scroll up</a>'
# ...
```


## Usage as precompiler

If the document extension is `.inlinejs|js.handlebars|hbs|hb`, the plugin will produce a precompiled template. In this case, you can customise the precompiled template via the following:

``` coffee
# ...
plugins:
	handlebars:
		precompileOpts:
			wrapper: "default"
# ...
```

Available values for the wrapper option are:

- `"default"`: Produces a handlebars wrapper like:
	``` javascript
	(function() {
		var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
		templates['theSlugOfTheFile'] = template(function (Handlebars,depth0,helpers,partials,data) {
			...
		})
	})();
	```

- `"amd"`: Produces a AMD handlebars wrapper like:
	``` javascript
	define(['handlebars'], function(Handlebars) {
		var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
		templates['theSlugOfTheFile'] = template(function (Handlebars,depth0,helpers,partials,data) {
			...
		});
	});
	```

- `"none"`:  Produces a basic wrapper like:
	``` javascript
	function (Handlebars,depth0,helpers,partials,data) {
		...
	}
	```



## History

You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012 [Mike Moulton](http://meltmedia.com)