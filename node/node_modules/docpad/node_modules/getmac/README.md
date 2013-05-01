# getmac for node.js

Get the mac address of the current machine you are on.

## Install

1. [Install Node.js](http://bevry.me/node/install)
1. Install it locally via: `npm install getmac`
1. Try it globally with: `npm install -g getmac` and  `getmac-node`

## Usage

```
// Fetch the computer's mac address
require('getmac').getMac(function(err,macAddress){
	if (err)  throw err;
	console.log(macAddress);	
});

// Validate that an address is a mac address
if ( require('getmac').isMac("e4:ce:8f:5b:a7:fc") ) {
	console.log('valid mac');
}
else {
	console.log('invalid mac');
}
```


## History
You can discover the history inside the [History.md](https://github.com/bevry/getmac/blob/master/History.md#files) file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me) <us@bevry.me>