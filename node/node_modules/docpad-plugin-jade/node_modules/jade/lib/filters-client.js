/*!
 * Jade - filters
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

module.exports = filter;
function filter(name, str, options) {
  if (typeof filter[name] === 'function') {
    var res = filter[name](str, options);
  } else {
    throw new Error('unknown filter ":' + name + '"');
  }
  return res;
}
filter.exists = function (name, str, options) {
  return typeof filter[name] === 'function';
};
