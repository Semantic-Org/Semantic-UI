# File - Common higher level file and path operations

## Install

<pre>
  npm install file
</pre>

<pre>
  var file = require("file");
</pre>

## API

### file.walk(start, callback)

Navigates a file tree, calling callback for each directory, passing in (null, dirPath, dirs, files).


### file.walkSync(start, callback)

Like file.walk but synchronous.


### file.mkdirs(path, mode, callback)

Makes all the directories in a path. (analgous to mkdir -P) For example given a path like "test/this/path" in an empty directory, mkdirs would make the directories "test", "this" and "path".


### file.mkdirsSync(path, mode)

Like file.mkdirs but synchronous.


### file.path.abspath(path)

Expands ".", "..", "~" and non root paths to their full absolute path. Relative paths default to being children of the current working directory.


### file.path.relpath(root, fullPath)

Given a root path, and a fullPath attempts to diff between the two to give us an acurate path relative to root.


### file.path.join(head, tail)

Just like path.join but haves a little more sanely when give a head equal to "". file.path.join("", "tail") returns "tail", path.join("", "tail") returns "/tail"
