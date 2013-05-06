var assert = require('assert');
var events = require('events');
var help   = require('../lib/commands/help');

describe('help', function () {

  it('Should have line method', function () {
    assert(!!help.line);
  });

  it('Should return an emiter', function () {
    assert(help() instanceof events.EventEmitter);
  });

  it('Should emit end event', function (next) {
    help('install').on('end', function (data) {
      assert(!!data);
      next();
    });
  });

  it('Should emit end event with data string', function (next) {
    help('install').on('end', function (data) {
      assert(typeof data === 'string');
      next();
    });
  });

});