'use strict';


var loader = require('./js-yaml/loader');
var dumper = require('./js-yaml/dumper');


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


module.exports.Type           = require('./js-yaml/type');
module.exports.Schema         = require('./js-yaml/schema');
module.exports.MINIMAL_SCHEMA = require('./js-yaml/schema/minimal');
module.exports.SAFE_SCHEMA    = require('./js-yaml/schema/safe');
module.exports.DEFAULT_SCHEMA = require('./js-yaml/schema/default');
module.exports.load           = loader.load;
module.exports.loadAll        = loader.loadAll;
module.exports.safeLoad       = loader.safeLoad;
module.exports.safeLoadAll    = loader.safeLoadAll;
module.exports.dump           = dumper.dump;
module.exports.safeDump       = dumper.safeDump;
module.exports.YAMLException  = require('./js-yaml/exception');
module.exports.scan           = deprecated('scan');
module.exports.parse          = deprecated('parse');
module.exports.compose        = deprecated('compose');
module.exports.addConstructor = deprecated('addConstructor');


require('./js-yaml/require');
