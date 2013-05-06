var assert = require('assert');
var search = require('../lib/commands/search');
var nock   = require('nock');

describe('search', function () {

  afterEach(function () {
    nock.cleanAll();
  });

  it('Should have line method', function () {
    assert(!!search.line);
  });

  it('Should emit end event', function (next) {
    nock('https://bower.herokuapp.com')
        .get('/packages/search/asdf')
        .reply(200, {});

    search('asdf')
      .on('end', function () {
        next();
      });
  });

  it('Should emit a packages event for search when nothing is found', function (next) {
    nock('https://bower.herokuapp.com')
        .get('/packages/search/asdf')
        .reply(200, {});

    search('asdf').on('packages', function (packages) {
      assert.deepEqual([], packages);
      next();
    });
  });

  it('Should emit a packages event for search when something is found', function (next) {
    var expected = [
      { name: 'fawagahds-mobile',
        url: 'git://github.com/strongbad/fawagahds-mobile.js',
        endpoint: undefined
      }
    ];

    nock('https://bower.herokuapp.com')
        .get('/packages/search/fawagahds')
        .reply(200, expected);

    search('fawagahds').on('packages', function (packages) {
      assert.deepEqual(packages, expected);
      next();
    });
  });

});