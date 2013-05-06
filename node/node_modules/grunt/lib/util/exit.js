/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

// This seems to be required in Windows (as of Node.js 0.8.7) to ensure that
// stdout/stderr are flushed before the process exits.

// https://gist.github.com/3427148
// https://gist.github.com/3427357

exports.exit = function exit(exitCode) {
  if (process.stdout._pendingWriteReqs || process.stderr._pendingWriteReqs) {
    process.nextTick(function() {
      exit(exitCode);
    });
  } else {
    process.exit(exitCode);
  }
};
