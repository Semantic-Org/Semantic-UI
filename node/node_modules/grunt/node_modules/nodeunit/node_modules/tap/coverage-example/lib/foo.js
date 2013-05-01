var Foo = module.exports = function(str) {
  this.foo = str;
  this.str = str;
};

Foo.prototype.bar = function() {
  var self = this;
  return self.foo;
};

Foo.prototype.baz = function() {
  var self = this;
  return self.str;
};

