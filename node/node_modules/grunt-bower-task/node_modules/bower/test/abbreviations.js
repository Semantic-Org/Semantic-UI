/*jshint plusplus:false*/

var bower   = require('../lib');
var assert  = require('assert');

var commandsList = Object.keys(bower.commands);
var abbreviations = bower.abbreviations;

describe('abbreviations', function () {
  it('Should contain all commands in full', function () {
    commandsList.forEach(function (command) {
      assert(abbreviations[command]);
    });
  });
  it('Should contain abbreviations that are not ambiguous', function () {
    assert.equal(abbreviations.s, 'search');
    assert.equal(abbreviations.i, 'install');
    assert.equal(abbreviations.ins, 'install');
    assert.equal(abbreviations.inst, 'install');
    assert.equal(abbreviations.rm, 'uninstall');
    assert.equal(abbreviations.cache, 'cache-clean');
    assert.equal(abbreviations.compl, 'completion');
  });
});
