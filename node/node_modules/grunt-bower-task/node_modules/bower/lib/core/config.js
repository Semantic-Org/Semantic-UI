var path       = require('path');
var fs         = require('fs');
var _          = require('lodash');
var tmp        = require('tmp');

var fileExists = require('../util/file-exists').sync;

var temp = process.env.TMPDIR
 || process.env.TMP
 || process.env.TEMP
 || process.platform === 'win32' ? 'c:\\windows\\temp' : '/tmp';

var home = (process.platform === 'win32'
  ? process.env.USERPROFILE
  : process.env.HOME) || temp;

var roaming =  process.platform === 'win32'
  ? path.resolve(process.env.APPDATA || home || temp)
  : path.resolve(home || temp);

var folder = process.platform === 'win32'
  ? 'bower'
  : '.bower';

var proxy = process.env.HTTPS_PROXY
 || process.env.https_proxy
 || process.env.HTTP_PROXY
 || process.env.http_proxy;

// Bower Config
var config;
try {
  config = require('rc') ('bower', {
    cache      :  path.join(roaming, folder, 'cache'),
    links      :  path.join(roaming, folder, 'links'),
    completion :  path.join(roaming, folder, 'completion'),
    json       : 'component.json',
    endpoint   : 'https://bower.herokuapp.com',
    directory  : 'components',
    proxy      : proxy
  });
} catch (e) {
  throw new Error('Unable to parse global .bowerrc file: ' + e.message);
}

// If there is a local .bowerrc file, merge it
var localFile = path.join(process.cwd(), '.bowerrc');
if (fileExists(localFile)) {
  try {
    _.extend(config, JSON.parse(fs.readFileSync(localFile)));
  } catch (e) {
    throw new Error('Unable to parse local .bowerrc file: ' + e.message);
  }
}

// Configure tmp package to use graceful degradationn
// If an uncaught exception occurs, the temporary directories will be deleted nevertheless
tmp.setGracefulCleanup();

module.exports = config;
