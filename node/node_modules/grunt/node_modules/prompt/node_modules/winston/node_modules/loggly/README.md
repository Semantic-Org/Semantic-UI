# node-loggly

A client implementation for Loggly in node.js

## Installation

### Installing npm (node package manager)
``` bash
  $ curl http://npmjs.org/install.sh | sh
```

### Installing node-loggly
``` bash
  $ [sudo] npm install loggly
```

## Usage

The node-loggly library is compliant with the [Loggly API][0]. Using node-loggly is easy for a variety of scenarios: logging, working with devices and inputs, searching, and facet searching.

### Getting Started
Before we can do anything with Loggly, we have to create a client with valid credentials. We will authenticate for you automatically: 

``` js
  var loggly = require('loggly');
  var config = {
    subdomain: "your-subdomain",
    auth: {
      username: "your-username",
      password: "your-password"
    }
  };
  var client = loggly.createClient(config);
```

### Logging
There are two ways to send log information to Loggly via node-loggly. The first is to simply call client.log with an appropriate input token:

``` js
  client.log('your-really-long-input-token', '127.0.0.1 - Theres no place like home', function (err, result) {
    // Do something once you've logged
  });
```

Note that the callback in the above example is optional, if you prefer the 'fire and forget' method of logging:

``` js
  client.log('your-really-long-input-token', '127.0.0.1 - Theres no place like home');
```

The second way to send log information to Loggly is to do so once you've retrieved an input directly from Loggly:

``` js
  client.getInput('your-input-name', function (err, input) {
    input.log('127.0.0.1 - Theres no place like home');
  });
```

Again the callback in the above example is optional and you can pass it if you'd like to.

### Logging Shallow JSON Object Literals as a String
In addition to logging pure strings it is also possible to pass shallow JSON object literals (i.e. no nested objects) to client.log(..) or input.log(..) methods, which will get converted into the [Loggly recommended string representation][1]. So

``` js
  var source = {
    foo: 1,
    bar: 2,
    buzz: 3
  };
  
  input.log(source);
```

will be logged as: 

```
  foo=1,bar=2,buzz=3
```

### Logging Objects to JSON Enabled Loggly Inputs
It is also possible to log complex objects using the new JSON capabilities of Loggly. To enable JSON functionality in the client simply add 'json: true' to the configuration:

``` js
  var config = {
    subdomain: "your-subdomain",
    auth: {
      username: "your-username",
      password: "your-password"
    },
    json: true
  };
```

When the json flag is enabled, objects will be converted to JSON using JSON.stringify before being transmitted to Loggly. So

``` js
  var source = {
    foo: 1,
    bar: 2,
    buzz: {
      sheep: 'jumped',
      times: 10
    }
  };

  input.log(source);
```

will be logged as:

``` json
  { "foo": 1, "bar": 2, "buzz": {"sheep": "jumped", "times": 10 }}
```

### Searching
[Searching][3] with node-loggly is easy. All you have to do is use the search() method defined on each Loggly client:

``` js
  var util = require('util');
  
  client.search('404', function (err, results) {
    // Inspect the result set
    util.inspect(results.data);
  });
```

The search() exposes a chainable interface that allows you to set additional search parameters such as: ip, input name, rows, start, end, etc. 

``` js
  var util = require('util');
  
  client.search('404')
        .meta({ ip: '127.0.0.1', inputname: test })
        .context({ rows: 10 })
        .run(function (err, results) {
          // Inspect the result set
          util.inspect(results.data);
        });
```

The context of the search (set using the `.context()` method) represents additional parameters in the Loggly API besides the search query itself. See the [Search API documentation][9] for a list of all options.

Metadata set using the `.meta()` method is data that is set in the query parameter of your Loggly search, but `:` delimited. For more information about search queries in Loggly, check out the [Search Language Guide][4] on the [Loggly Wiki][5].

### Facet Searching
Loggly also exposes searches that can return counts of events over a time range. These are called [facets][6]. The valid facets are 'ip', 'date', and 'input'. Performing a facet search is very similar to a normal search: 

``` js
  var util = require('util');
  
  client.facet('ip', '404')
        .context({ buckets: 10 })
        .run(function (err, results) {
          // Inspect the result set
          util.inspect(results.data);
        });
```

The chaining and options for the facet method(s) are the same as the search method above. 

### Working with Devices and Inputs
Loggly exposes several entities that are available through node-loggly: inputs and devices. For more information about these terms, checkout the [Loggly Jargon][7] on the wiki. There are several methods available in node-loggly to work with these entities: 

``` js
  //
  // Returns all inputs associated with your account
  //
  client.getInputs(function (err, inputs) { /* ... */ });
  
  //
  // Returns an input with the specified name
  //
  client.getInput('input-name', function (err, input) { /* ... */ });
  
  //
  // Returns all devices associated with your account
  //
  client.getDevices(function (err, devices) { /* ... */ });
```

## Run Tests
All of the node-loggly tests are written in [vows][8], and cover all of the use cases described above. You will need to add your Loggly username, password, subdomain, and a two test inputs to test/data/test-config.json before running tests. When configuring the test inputs on Loggly, the first test input should be named 'test' using the HTTP service. The second input should be name 'test_json' using the HTTP service with the JSON logging option enabled:

``` js
  {
    "subdomain": "your-subdomain",
    "auth": {
      "username": "your-username",
      "password": "your-password"
    },
    "inputs": {
      "test": {
        //
        // Token and ID of your plain-text input.
        //
        "token": "your-really-long-token-you-got-when-you-created-an-http-input",
        "id": 000
      },
      "test_json": {
        //
        // Token and ID of your JSON input.
        //
        "token": "your-really-long-token-you-got-when-you-created-an-http-input",
        "id": 001
      },
    }
  }
```

Once you have valid Loggly credentials you can run tests with [vows][8]:

``` bash
  $ npm test
```

#### Author: [Charlie Robbins](http://www.github.com/indexzero)
#### Contributors: [Marak Squires](http://github.com/marak), [hij1nx](http://github.com/hij1nx), [Kord Campbell](http://loggly.com), [Erik Hedenström](http://github.com/ehedenst),

[0]: http://wiki.loggly.com/apidocumentation
[1]: http://wiki.loggly.com/loggingfromcode
[3]: http://wiki.loggly.com/retrieve_events#search_uri
[4]: http://wiki.loggly.com/searchguide
[5]: http://wiki.loggly.com/
[6]: http://wiki.loggly.com/retrieve_events#facet_uris
[7]: http://wiki.loggly.com/loggingjargon
[8]: http://vowsjs.org
[9]: http://wiki.loggly.com/retrieve_events#optional
