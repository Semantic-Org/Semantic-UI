/*
 * simple-prompt.js: Simple example of using prompt.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var prompt = require('../lib/prompt');

//
// Start the prompt
//
prompt.start();

//
// Get two properties from the user: username and password
//
prompt.get([{ 
    name:'password', 
    hidden: true, 
    validator: function (value, next) {
      setTimeout(next, 200);
    }
  }], function (err, result) {
  //
  // Log the results.
  //
  console.log('Command-line input received:');
  console.log('  password: ' + result.password);
});
