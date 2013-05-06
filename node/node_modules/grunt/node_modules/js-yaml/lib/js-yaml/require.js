'use strict';


var fs     = require('fs');
var loader = require('./loader');


function yamlRequireHandler(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');

  // fill in documents
  module.exports = loader.load(content, { filename: filename });
}

// register require extensions only if we're on node.js
// hack for browserify
if (undefined !== require.extensions) {
  require.extensions['.yml']  = yamlRequireHandler;
  require.extensions['.yaml'] = yamlRequireHandler;
}


module.exports = require;
