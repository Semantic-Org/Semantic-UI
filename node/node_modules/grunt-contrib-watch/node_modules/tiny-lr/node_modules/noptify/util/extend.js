

// Simple extend utility method

module.exports = function extend(obj) {
  var args = Array.prototype.slice.call(arguments, 1);

  args.forEach(function(o) {
    Object.keys(o).forEach(function(prop) {
      obj[prop] = o[prop];
    });
  });

  return obj;
}
