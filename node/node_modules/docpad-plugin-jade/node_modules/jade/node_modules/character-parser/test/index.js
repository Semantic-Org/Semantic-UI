var assert = require('better-assert');
var parser = require('../');
var parse = parser;

it('works out how much depth changes', function () {
  var state = parse('foo(arg1, arg2, {\n  foo: [a, b\n');
  assert(state.roundDepth === 1);
  assert(state.curlyDepth === 1);
  assert(state.squareDepth === 1);

  parse('    c, d]\n  })', state);
  assert(state.squareDepth === 0);
  assert(state.curlyDepth === 0);
  assert(state.roundDepth === 0);
});

it('finds contents of bracketed expressions', function () {
  var section = parser.parseMax('foo="(", bar="}") bing bong');
  assert(section.start === 0);
  assert(section.end === 16);//exclusive end of string
  assert(section.src = 'foo="(", bar="}"');

  var section = parser.parseMax('{foo="(", bar="}"} bing bong', {start: 1});
  assert(section.start === 1);
  assert(section.end === 17);//exclusive end of string
  assert(section.src = 'foo="(", bar="}"');
});

it('finds code up to a custom delimiter', function () {
  var section = parser.parseUntil('foo.bar("%>").baz%> bing bong', '%>');
  assert(section.start === 0);
  assert(section.end === 17);//exclusive end of string
  assert(section.src = 'foo.bar("%>").baz');

  var section = parser.parseUntil('<%foo.bar("%>").baz%> bing bong', '%>', {start: 2});
  assert(section.start === 2);
  assert(section.end === 19);//exclusive end of string
  assert(section.src = 'foo.bar("%>").baz');
});

describe('regressions', function () {
  describe('#1', function () {
    it('parses regular expressions', function () {
      var section = parser.parseMax('foo=/\\//g, bar="}") bing bong');
      assert(section.start === 0);
      assert(section.end === 18);//exclusive end of string
      assert(section.src = 'foo=/\\//g, bar="}"');
    })
  })
})