/*
 * history.js: Example of using the prompt history capabilities.  
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */
 
var prompt = require('../lib/prompt');

//
// Start the prompt
//
prompt.start();

var properties = [
  {
    name: 'animal', 
    description: 'Enter an animal',
    default: 'dog',
    validator: /dog|cat/
  },
  {
    name: 'sound', 
    description: 'What sound does this animal make?',
    validator: function (value) {
      var animal = prompt.history(0).value;
      
      return animal === 'dog' && value === 'woof'
        || animal === 'cat' && value === 'meow';
    }
  }
]

//
// Get two properties from the user
//
prompt.get(properties, function (err, result) {
  //
  // Log the results.
  //
  console.log('Command-line input received:');
  console.log('  animal: ' + result.animal);
  console.log('  sound: ' + result.sound);
});