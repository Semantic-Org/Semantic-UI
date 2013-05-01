# Task Group

[![Build Status](https://secure.travis-ci.org/bevry/taskgroup.png?branch=master)](http://travis-ci.org/bevry/taskgroup)
[![NPM version](https://badge.fury.io/js/taskgroup.png)](https://npmjs.org/package/taskgroup)

Group together synchronous and asynchronous tasks and execute them with support for concurrency, naming, and nesting.



## Install

### Backend

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save taskgroup`

### Frontend

1. [See Browserify](http://browserify.org/)



## Usage

### Example

``` javascript
// Import
var TaskGroup = require('taskgroup').TaskGroup;

// Create our new group
var group = new TaskGroup();

// Define what should happen once the group has completed
group.once('complete', function(err,results){
	// Log the error that has occured
	console.log(err);
	// => null

	// Log the results that our group received from the executing items
	console.log(JSON.stringify(results));
	/*	=>
		[
			[null, 'first', 'task'],
			[null, 'second task'],
			[null, [
				[null, 'sub second task'],
				[null, 'sub first', 'task']
			]]
		]
	*/
});

// Add an asynchronous task that gives the result to the completion callback
group.addTask(function(complete){
	setTimeout(function(){
		complete(null, 'first', 'task');
	},500);
});

// Add a synchronous task that returns the result
// Errors should be returned, though if an error is thrown we will catch it
group.addTask(function(){
	return 'second task';
});

// Add a sub-group to our exiting group
group.addGroup(function(addGroup,addTask){
	// Tell this sub-group to execute in parallel (all at once) by setting its concurrency to unlimited
	// by default the concurrency for all groups is set to 1
	// which means that they execute in serial fashion (one after the other, instead of all at once)
	this.setConfig({concurrency:0});

	// Add an asynchronous task that gives its result to the completion callback
	addTask(function(complete){
		setTimeout(function(){
			complete(null, 'sub first', 'task');
		},500);
	});

	// Add a synchronous task that returns its result
	addTask(function(){
		return 'sub second task';
	});
});

// Execute our group
group.run();
```

### TaskGroup API

``` javascript
new require('taskgroup').TaskGroup()
```

- Available methods:
	- `constructor(name?,fn?)` - create our new group, the arguments `name` and `fn` are optional, refer to their entries in configuration
	- `setConfig(config)` - set the configuration for the group, returns chain
	- `addTask(args...)` - create a new task item with the arguments and adds it to the group, returns the new task item
	- `addGroup(args...)` - create a new group item with the arguments and adds it to the group, returns the new group item
	- `getTotals()` - returns counts for the following `{running,remaining,completed,total}`
	- `clear()` - remove the remaining items to be executed
	- `pause()` - pause the execution of the items
	- `stop()` - clear and pause
	- `exit(err)` - stop and complete, `err` if specified is sent to the completion event when fired
	- `complete()` - will fire the completion event if we are already complete, useful if you're binding your listeners after run
	- `run()` - start/resume executing the items, returns chain
	- All those of [EventEmitter2](https://github.com/hij1nx/EventEmitter2)
- Available configuration:
	- `name`, no default - allows us to assign a name to the group, useful for debugging
	- `fn(addGroup,addTask,complete?)`, no default - allows us to use an inline and self-executing style for defining groups, useful for nesting
	- `concurrency`, defaults to `1` - how many items shall we allow to be run at the same time, set to `0` to allow unlimited
	- `pauseOnError`, defaults to `true` - if an error occurs in one of our items, should we stop executing any remaining items?
		- setting to `false` will continue with execution with the other items even if an item experiences an error
- Available events:
	- `run()` - fired just before we execute the items
	- `complete(err, results)` - fired when all our items have completed
	- `task.run(task)` - fired just before a task item executes
	- `task.complete(task, err, args...)` - fired when a task item has completed
	- `group.run(group)` - fired just before a group item executes
	- `group.complete(group, err, results)` - fired when a group item has completed
	- `item.run(item)` - fired just before an item executes (fired for both sub-tasks and sub-groups)
	- `item.complete(item, err, args...)` - fired when an item has completed (fired for both sub-task and sub-groups)


### Task API

``` javascript
new require('taskgroup').Task()
```

- Available methods:
	- `constructor(name?,fn?)` - create our new task, the arguments `name` and `fn` are optional though `fn` must be set at some point, refer to their entries in configuration
	- `setConfig(config)` - set the configuration for the group, returns chain
	- `complete()` - will fire the completion event if we are already complete, useful if you're binding your listeners after run
	- `run()` - execute the task
- Available configuration:
	- `name`, no default - allows us to assign a name to the group, useful for debugging
	- `fn(complete?)`, no default - must be set at some point, it is the function to execute for the task, if it is asynchronous it should use the completion callback provided
	- `args`, no default - an array of arguments that you would like to precede the completion callback when executing `fn`
- Available events:
	- `run()` - fired just before we execute the task
	- `complete(err, args...)` - fired when the task has completed



## History
You can discover the history inside the [History.md](https://github.com/bevry/taskgroup/blob/master/History.md#files) file



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
