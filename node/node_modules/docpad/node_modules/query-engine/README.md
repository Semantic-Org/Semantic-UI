# QueryEngine [![Build Status](https://secure.travis-ci.org/bevry/query-engine.png?branch=master)](http://travis-ci.org/bevry/query-engine)

QueryEngine provides extensive Querying, Filtering, and Searching abilities for [Backbone.js Collections](http://documentcloud.github.com/backbone/#Collection) as well as JavaScript arrays and objects. The Backbone.js and Underscore dependencies are optional.


## Features

* includes a [live interactive demos](http://bevry.github.com/query-engine/out/demo/) with several examples, [wiki documentation](https://github.com/bevry/query-engine/wiki/Using) and [source-code documentation](https://github.com/bevry/query-engine/blob/master/lib/query-engine.coffee#files)
* runs on [node.js](http://nodejs.org/) and in the browser
* supports [NoSQL](http://www.mongodb.org/display/DOCS/Advanced+Queries) queries (like [MongoDB](http://www.mongodb.org/))
* supports filters (applying a filter function to a collection)
* supports search strings (useful for turning search input fields into useful queries)
* supports pills for search strings (e.g. `author:ben priority:important`)
* supports optional live collections (when a model is changed, added or removed, it can automatically be tested against the collections queries, filters, and search string, if it fails, remove it from the collection)
* supports parent and child collections (when a parent collection has a model removed, it is removed from the child collection too, when a parent collection has a model added or changed, it is retested against the child collection)
* actively maintained, supported, and implemented by several companies


## Installation

### Server-Side with Node.js

1. [Install Node.js](https://github.com/balupton/node/wiki/Installing-Node.js)

1. Install Backbone (optional, but required for `QueryCollection`)

	``` bash
	npm install backbone
	```

1. Install QueryEngine

	``` bash
	npm install query-engine
	```

1. Require QueryEngine

	``` javascript
	var queryEngine = require('query-engine');
	```


### Client-Side with Web Browsers

1. Include the necessary scripts

	``` html
	<!-- Optional: But required for QueryCollection -->
	<script src="http://documentcloud.github.com/underscore/underscore-min.js"></script>
	<script src="http://documentcloud.github.com/backbone/backbone-min.js"></script>

	<!-- Required -->
	<script src="http://raw.github.com/bevry/query-engine/master/out/lib/query-engine.js"></script>
	```

2. Access QueryEngine via the `window.queryEngine` variable


## Using

[You can find all the information you desire about using QueryEngine on its Using QueryEngine Wiki Page](https://github.com/bevry/query-engine/wiki/Using)


## History

[You can discover the history inside the `History.md` file](https://github.com/bevry/query-engine/blob/master/History.md#files)


## Compatability

Tested and working against Backbone versions 0.9.2, 0.9.9, and 1.0.0


## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
