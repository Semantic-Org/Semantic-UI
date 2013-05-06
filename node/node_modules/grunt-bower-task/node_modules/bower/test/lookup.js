var assert = require('assert');
var lookup = require('../lib/commands/lookup');
var nock   = require('nock');

describe('lookup', function () {

  afterEach(function () {
    nock.cleanAll();
  });

  it('Should have line method', function () {
    assert(!!lookup.line);
  });

  it('Should emit end event', function (next) {
    nock('https://bower.herokuapp.com')
        .get('/packages/asdf')
        .reply(404);

    lookup('asdf')
      .on('end', function () {
        next();
      });
  });

  it('Should not emit a package event for lookup when nothing is found', function (next) {
    var ok = true;

    nock('https://bower.herokuapp.com')
        .get('/packages/asdf')
        .reply(404);

    lookup('asdf')
      .on('package', function () {
        ok = false;
      })
      .on('end', function () {
        assert(ok === true);
        next();
      });
  });

  it('Should emit a package event for lookup when something is found', function (next) {
    var expected = {
      name: 'fawagahds-mobile',
      url: 'git://github.com/strongbad/fawagahds-mobile.js'
    };

    nock('https://bower.herokuapp.com')
        .get('/packages/fawagahds-mobile')
        .reply(200, expected);

    lookup('fawagahds-mobile', {}).on('package', function (pkg) {
      assert.deepEqual(pkg, expected);
      next();
    });
  });

});