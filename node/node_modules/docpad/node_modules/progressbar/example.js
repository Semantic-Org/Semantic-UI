var ProgressBar = require('./').ProgressBar;
var progress = new ProgressBar();
progress
	.step('the task you are currently performing')
	.setTotal(10);
setInterval(function(){
	progress.addTick()
	if ( progress.getTick() === 5 ) {
		progress.finish(); // remove
		console.log('finished!')
		process.exit()
	}
},500);