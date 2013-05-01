
var assert = require('assert');

var cookie = require('..');

suite('parse');

test('basic', function() {
    assert.deepEqual({ foo: 'bar' }, cookie.parse('foo=bar'));
    assert.deepEqual({ foo: '123' }, cookie.parse('foo=123'));
});

test('ignore spaces', function() {
    assert.deepEqual({ FOO: 'bar', baz: 'raz' },
            cookie.parse('FOO    = bar;   baz  =   raz'));
});

test('escaping', function() {
    assert.deepEqual({ foo: 'bar=123456789&name=Magic+Mouse' },
            cookie.parse('foo="bar=123456789&name=Magic+Mouse"'));

    assert.deepEqual({ email: ' ",;/' },
            cookie.parse('email=%20%22%2c%3b%2f'));
});

