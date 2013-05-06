var assert = require('assert');
var events = require('events');
var info   = require('../lib/commands/info');

describe('info', function () {

  it('Should have line method', function () {
    assert(!!info.line);
  });

  it('Should return an emiter', function () {
    assert(info() instanceof events.EventEmitter);
  });

  it('Should emit error event', function (next) {
    info('no-package-found').on('error', function (error) {
      assert(!!error);
      next();
    });
  });

  it('Should emit end event', function (next) {
    info('jquery').on('end', function (data) {
      assert(!!data);
      next();
    });
  });

  it('Should emit end event with data.pkg object', function (next) {
    info('jquery').on('end', function (data) {
      assert(typeof data.pkg === 'object');
      next();
    });
  });

  it('Should emit end event with data.versions array', function (next) {
    info('jquery').on('end', function (data) {
      assert(typeof data.versions === 'object');
      next();
    });
  });

});
