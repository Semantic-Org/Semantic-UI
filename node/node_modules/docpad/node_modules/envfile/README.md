# envfile

[![Build Status](https://secure.travis-ci.org/bevry/envfile.png?branch=master)](http://travis-ci.org/bevry/envfile)
[![NPM version](https://badge.fury.io/js/envfile.png)](https://npmjs.org/package/envfile)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Parse and environment environment files (.env) with Node.js


## What is a envfile?

They generally are named `.env` or `file.env` and can look like:

```
a=1
b:2
c = 3
d : 4
```



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save envfile`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Via Node.js

``` javascript
// Include envfile
envfile = require('envfile');

// Parse an envfile path
envfile.parseFile('file.env', function(err,obj){});  // async
result = envfile.parseFileSync('file.env');  // sync

// Parse an envfile string
envfile.parse(src, function(err,obj){});  // async
result = envfile.parseSync(src);  // sync

// Stringify a javascript object to an envfile string
envfile.stringify(obj, function(err,str){});  // async
result = envfile.stringifySync(obj);  // sync
```


### Via the Command Line

Requires a global installation of envfile: `npm install -g envfile`

``` bash
# envfile to JSON
echo -e "a=1\nb:2" | envfile2json > config.json

# JSON to envfile
echo '{"a":1,"b":2}' | json2envfile > config.env
```


## History
You can discover the version history inside the [History.md](https://github.com/bevry/envfile/blob/master/History.md#files) file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2013+ [Bevry Pty Ltd](http://bevry.me)
