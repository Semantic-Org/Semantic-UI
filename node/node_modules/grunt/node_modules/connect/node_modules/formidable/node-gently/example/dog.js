require('../test/common');
function Dog() {}

Dog.prototype.seeCat = function() {
  this.bark('whuf, whuf');
  this.run();
}

Dog.prototype.bark = function(bark) {
  require('sys').puts(bark);
}

var gently = new (require('gently'))
  , assert = require('assert')
  , dog = new Dog();

gently.expect(dog, 'bark', function(bark) {
  assert.equal(bark, 'whuf, whuf');
});
gently.expect(dog, 'run');

dog.seeCat();