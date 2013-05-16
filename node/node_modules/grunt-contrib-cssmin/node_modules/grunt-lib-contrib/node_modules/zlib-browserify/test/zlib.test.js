const test = require('tap').test;
const zlibA = require('zlib');
const zlibB = require('..');
const crypto = require('crypto');

test('zlibA.deflate -> zlibB.inflate', function (t) {
  const expect = crypto.randomBytes(1024);
  zlibA.deflate(expect, function (err, cmpA) {
    zlibB.inflate(cmpA, function (err, result) {
      t.same(result, expect, 'should match');
      t.end();
    });
  });
});

test('zlibB.deflate -> zlibA.inflate', function (t) {
  const expect = crypto.randomBytes(1024);
  zlibB.deflate(expect, function (err, cmpA) {
    zlibA.inflate(cmpA, function (err, result) {
      t.same(result, expect, 'should match');
      t.end();
    });
  });
});

test('zlibB.deflate -> zlibA.inflate (string)', function (t) {
  const expect = 'ohaihihihihihihihihihihihihihihihi';
  zlibB.deflate(expect, function (err, cmpA) {
    zlibA.inflate(cmpA, function (err, result) {
      t.same(result.toString(), expect, 'should match');
      t.end();
    });
  });
});

test('zlibA.gzip -> zlibB.gunzip', function (t) {
  const expect = crypto.randomBytes(1024);
  zlibA.gzip(expect, function (err, cmpA) {
    zlibB.gunzip(cmpA, function (err, result) {
      t.same(result, expect, 'should match');
      t.end();
    });
  });
});

test('zlibB.gzip -> zlibA.gunzip', function (t) {
  const expect = crypto.randomBytes(1024);
  zlibB.gzip(expect, function (err, cmpA) {
    zlibA.gunzip(cmpA, function (err, result) {
      t.same(result, expect, 'should match');
      t.end();
    });
  });
});

test('zlibB.gzip -> zlibA.gunzip', function (t) {
  const expect = 'lololololoollolololoololololololololololololololololololololol';
  zlibB.gzip(expect, function (err, cmpA) {
    zlibA.gunzip(cmpA, function (err, result) {
      t.same(result.toString(), expect, 'should match');
      t.end();
    });
  });
});

