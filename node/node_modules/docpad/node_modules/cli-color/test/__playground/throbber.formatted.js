#!/usr/bin/env node

'use strict';

var throbber = require('../../lib/throbber')
  , interval = require('clock/lib/interval')
  , format   = require('../../lib/index').red;

var i = interval(200, true);
setTimeout(i.stop.bind(i), 1100);

throbber(i, format);
process.stdout.write('START');
