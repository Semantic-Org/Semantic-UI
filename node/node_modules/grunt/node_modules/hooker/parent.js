var spawn = require('child_process').spawn;

function loop() {
  console.log('starting');
  console.log(this);
  //var child = spawn('./node_modules/nodeunit/bin/nodeunit', ['test']);
  var child = spawn('node', ['child.js']);
  child.stdout.on('data', function(buffer) {
    process.stdout.write(buffer);
  });
  child.on('exit', this.async());
}

var context = {
  async: function() { return loop.bind(context); }
};
loop.call(context);