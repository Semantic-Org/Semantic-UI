# ProgressBar

[![NPM version](https://badge.fury.io/js/progressbar.png)](https://npmjs.org/package/progressbar)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

A nice wrapper around [TJ Holowaychuck's](https://github.com/visionmedia) [node-progress](https://github.com/visionmedia/node-progress) with chaining, domains, and steps


## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save progressbar`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example

``` javascript
var ProgressBar = require('progressbar').ProgressBar;
var progress = new ProgressBar();
progress
	.step('the task you are currently performing')
	.setTotal(5)
	.setTick(1)
	.setTick(2)
	.setTick(3)
	.addTick()
	.addTick();
```

### ProgressBar API

- `step(step)` - set the step, resets the total and the tick
- `setTick(ticks)` - set the completed ticks
- `addTick()` - add 1 to the completed ticks
- `getTick()` - get the completed ticks
- `setTotal(total)` - set the total ticks
- `addTotal()` - add 1 to the total ticks
- `getTotal()` - get the total ticks
- `finish()` - finish manually, will destroy the progress bar



## History
You can discover the history inside the [History.md](https://github.com/bevry/progressbar/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
