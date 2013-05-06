var
  fs    = require('fs'),
  join  = require('path').join,
  spawn = require('./spawn');

var unsafe = spawn.arg;

spawn.tmpFunction({ unsafeCleanup: unsafe }, function (err, name) {
  if (err) {
    spawn.err(err, spawn.exit);
    return;
  }

  try {
    var fd = fs.openSync(join(name, 'should-be-removed.file'), 'w');
    fs.closeSync(fd);

    spawn.out(name, spawn.exit);
  } catch (e) {
    spawn.err(e.toString(), spawn.exit);
  }
});
