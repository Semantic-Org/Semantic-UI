// Import
var TaskGroup = require('./').TaskGroup;

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