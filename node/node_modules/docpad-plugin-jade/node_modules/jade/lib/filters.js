/*!
 * Jade - filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var transformers = require('transformers');

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    var res = filter[name](str, options);
  } else if (transformers[name]) {
    var res = transformers[name].renderSync(str, options);
    if (transformers[name].outputFormat === 'js') {
      res = '<script type="text/javascript">\n' + res + '</script>';
    } else if (transformers[name].outputFormat === 'css') {
      res = '<style type="text/css">' + res + '</style>';
    } else if (transformers[name].outputFormat === 'xml') {
      res = res.replace(/'/g, '&#39;');
    }
  } else {
    throw new Error('unknown filter ":' + name + '"');
  }
  return res;
}
filter.exists = function (name, str, options) {
  return typeof filter[name] === 'function' || transformers[name];
};
