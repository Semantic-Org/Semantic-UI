var test = require('tap').test;
var burrito = require('../');

test('call label', function (t) {
    t.plan(1);
    
    burrito('foo(10)', function (node) {
        if (node.name === 'call') {
            t.equal(node.label(), 'foo');
        }
    });
});

test('var label', function (t) {
    t.plan(1);
    
    burrito('var x = 2', function (node) {
        if (node.name === 'var') {
            t.same(node.label(), [ 'x' ]);
        }
    });
});

test('vars label', function (t) {
    t.plan(1);
    
    burrito('var x = 2, y = 3', function (node) {
        if (node.name === 'var') {
            t.same(node.label(), [ 'x', 'y' ]);
        }
    });
});

test('defun label', function (t) {
    t.plan(1);
    
    burrito('function moo () {}', function (node) {
        if (node.name === 'defun') {
            t.same(node.label(), 'moo');
        }
    });
});

test('function label', function (t) {
    t.plan(1);
    
    burrito('(function zzz () {})()', function (node) {
        if (node.name === 'function') {
            t.same(node.label(), 'zzz');
        }
    });
});

test('anon function label', function (t) {
    t.plan(1);
    
    burrito('(function () {})()', function (node) {
        if (node.name === 'function') {
            t.equal(node.label(), null);
        }
    });
});

test('dot call label', function (t) {
    t.plan(1);
    
    burrito('process.nextTick(fn)', function (node) {
        if (node.name === 'call') {
            t.equal(node.label(), 'nextTick');
        }
    });
});

test('triple dot label', function (t) {
    t.plan(1);
    
    burrito('a.b.c(fn)', function (node) {
        if (node.name === 'call') {
            t.equal(node.label(), 'c');
        }
    });
});

test('expr label', function (t) {
    t.plan(1);
    
    burrito('a.b[x+1](fn)', function (node) {
        if (node.name === 'call') {
            t.ok(node.label() === null);
        }
    });
});
