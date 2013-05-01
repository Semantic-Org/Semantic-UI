(function() {
  var XMLBuilder;
  XMLBuilder = require('./XMLBuilder');
  module.exports.create = function() {
    return new XMLBuilder();
  };
}).call(this);
