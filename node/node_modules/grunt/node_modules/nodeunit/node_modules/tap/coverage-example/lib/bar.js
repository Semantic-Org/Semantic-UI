var Bar = module.exports = function(str) {
  this.bar = str;
  this.str = str;
};

Bar.prototype.foo = function() {
  var self = this;
  return self.bar;
};

Bar.prototype.baz = function() {
  var self = this;
  return self.str;
};

