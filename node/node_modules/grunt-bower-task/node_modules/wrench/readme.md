wrench.js - Recursive file operations in Node.js
----------------------------------------------------------------------------
While I love Node.js, I've found myself missing some functions. Things like
recursively deleting/chmodding a directory (or even deep copying a directory),
or even a basic line reader, shouldn't need to be re-invented time and time again.

That said, here's my attempt at a re-usable solution, at least until something
more formalized gets integrated into Node.js (*hint hint*). wrench.js is fairly simple
to use - check out the documentation/examples below:

Installation
-----------------------------------------------------------------------------

    npm install wrench

Usage
-----------------------------------------------------------------------------
``` javascript
var wrench = require('wrench'),
	util = require('util');
```

### Synchronous operations
``` javascript
// Recursively create directories, sub-trees and all.
wrench.mkdirSyncRecursive(dir, 0777);

// Recursively delete the entire sub-tree of a directory, then kill the directory
wrench.rmdirSyncRecursive('my_directory_name', failSilently);

// Recursively read directories contents.
wrench.readdirSyncRecursive('my_directory_name');

// Recursively chmod the entire sub-tree of a directory
wrench.chmodSyncRecursive('my_directory_name', 0755);

// Recursively chown the entire sub-tree of a directory
wrench.chownSyncRecursive("directory", uid, gid);

// Deep-copy an existing directory
wrench.copyDirSyncRecursive('directory_to_copy', 'location_where_copy_should_end_up');

// Read lines in from a file until you hit the end
var f = new wrench.LineReader('x.txt');
while(f.hasNextLine()) {
	util.puts(x.getNextLine());
}

// Note: You will need to close that above line reader at some point, otherwise
// you will run into a "too many open files" error. f.close() or fs.closeSync(f.fd) are
// your friends, as only you know when it is safe to close.
```

### Asynchronous operations
``` javascript
// Recursively read directories contents
var files = [];
wrench.readdirRecursive('my_directory_name', function(error, curFiles) {
    // curFiles is what you want
});
```

Questions, comments? Hit me up. (ryan [at] venodesigns.net | http://twitter.com/ryanmcgrath)
