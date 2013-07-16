# Handlebars Plugin for [DocPad](https://docpad.org)

[![Build Status](https://secure.travis-ci.org/docpad/docpad-plugin-handlebars.png?branch=master)](http://travis-ci.org/docpad/docpad-plugin-handlebars "Check this project's build status on TravisCI")
[![NPM version](https://badge.fury.io/js/docpad-plugin-handlebars.png)](https://npmjs.org/package/docpad-plugin-handlebars "View this project on NPM")
[![Flattr donate button](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/au/cgi-bin/webscr?cmd=_flow&SESSION=IHj3DG3oy_N9A9ZDIUnPksOi59v0i-EWDTunfmDrmU38Tuohg_xQTx0xcjq&dispatch=5885d80a13c0db1f8e263663d3faee8d14f86393d55a810282b64afed84968ec "Donate once-off to this project using Paypal")

Adds support for the [Handlebars](http://handlebarsjs.com/) templating engine to [DocPad](https://docpad.org)

Convention:  `.(inlinejs|js|anything).(handlebars|hbs|hb)`


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

If the document extension is `.(inlinejs|js).(handlebars|hbs|hb)`, the plugin will produce a precompiled template. In this case, you can customise the precompiled template via the following:

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
[You can discover the history inside the `History.md` file](https://github.com/bevry/docpad-plugin-handlebars/blob/master/History.md#files)


## Contributing
[You can discover the contributing instructions inside the `Contributing.md` file](https://github.com/bevry/docpad-plugin-handlebars/blob/master/Contributing.md#files)


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Mike Moulton](http://meltmedia.com) <mike@meltmedia.com>
