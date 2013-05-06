/*
 * grunt
 * http://gruntjs.com/
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * https://github.com/gruntjs/grunt/blob/master/LICENSE-MIT
 */

'use strict';

// External lib.
var EventEmitter2 = require('eventemitter2').EventEmitter2;

// Awesome.
module.exports = new EventEmitter2({wildcard: true});
