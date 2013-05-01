var Options = require('options')
  , assert = require('assert');

describe('Options', function() {
  describe('#ctor', function() {
    it('initializes options', function() {
      var option = new Options({a: true, b: false});
      assert.strictEqual(true, option.value.a);
      assert.strictEqual(false, option.value.b);
    });
  });

  describe('#merge', function() {
    it('merges options from another object', function() {
      var option = new Options({a: true, b: false});
      option.merge({b: true});
      assert.strictEqual(true, option.value.a);
      assert.strictEqual(true, option.value.b);
    });
    it('does nothing when arguments are undefined', function() {
      var option = new Options({a: true, b: false});
      option.merge(undefined);
      assert.strictEqual(true, option.value.a);
      assert.strictEqual(false, option.value.b);
    });
    it('cannot set values that werent already there', function() {
      var option = new Options({a: true, b: false});
      option.merge({c: true});
      assert.strictEqual('undefined', typeof option.value.c);
    });
    it('can require certain options to be defined', function() {
      var option = new Options({a: true, b: false, c: 3});
      var caughtException = false;
      try {
        option.merge({}, ['a', 'b', 'c']);
      }
      catch (e) {
        caughtException = e.toString() == 'Error: options a, b and c must be defined';
      }
      assert.strictEqual(true, caughtException);
    });
    it('can require certain options to be defined, when options are undefined', function() {
      var option = new Options({a: true, b: false, c: 3});
      var caughtException = false;
      try {
        option.merge(undefined, ['a', 'b', 'c']);
      }
      catch (e) {
        caughtException = e.toString() == 'Error: options a, b and c must be defined';
      }
      assert.strictEqual(true, caughtException);
    });
    it('returns "this"', function() {
      var option = new Options({a: true, b: false, c: 3});
      assert.strictEqual(option, option.merge());
    });
  });

  describe('#copy', function() {
    it('returns a new object with the indicated options', function() {
      var option = new Options({a: true, b: false, c: 3});
      option.merge({c: 4});
      var obj = option.copy(['a', 'c']);
      assert.strictEqual(true, obj.a);
      assert.strictEqual(4, obj.c);
      assert.strictEqual('undefined', typeof obj.b);
    });
  });

  describe('#value', function() {
    it('can be enumerated', function() {
      var option = new Options({a: true, b: false});
      assert.strictEqual(2, Object.keys(option.value).length);
    });
    it('can not be used to set values', function() {
      var option = new Options({a: true, b: false});
      option.value.b = true;
      assert.strictEqual(false, option.value.b);
    });
    it('can not be used to add values', function() {
      var option = new Options({a: true, b: false});
      option.value.c = 3;
      assert.strictEqual('undefined', typeof option.value.c);
    });
  });

  describe('#isDefined', function() {
    it('returns true if the named value is defined', function() {
      var option = new Options({a: undefined});
      assert.strictEqual(false, option.isDefined('a'));
      option.merge({a: false});
      assert.strictEqual(true, option.isDefined('a'));
    });
  });

  describe('#isDefinedAndNonNull', function() {
    it('returns true if the named value is defined and non-null', function() {
      var option = new Options({a: undefined});
      assert.strictEqual(false, option.isDefinedAndNonNull('a'));
      option.merge({a: null});
      assert.strictEqual(false, option.isDefinedAndNonNull('a'));
      option.merge({a: 2});
      assert.strictEqual(true, option.isDefinedAndNonNull('a'));
    });
  });

  describe('#read', function() {
    it('reads and merges config from a file', function() {
      var option = new Options({a: true, b: true});
      option.read(__dirname + '/fixtures/test.conf');
      assert.strictEqual('foobar', option.value.a);
      assert.strictEqual(false, option.value.b);
    });

    it('asynchronously reads and merges config from a file when a callback is passed', function(done) {
      var option = new Options({a: true, b: true});
      option.read(__dirname + '/fixtures/test.conf', function(error) {
        assert.strictEqual('foobar', option.value.a);
        assert.strictEqual(false, option.value.b);
        done();
      });
    });
  });

  describe('#reset', function() {
    it('resets options to defaults', function() {
      var option = new Options({a: true, b: false});
      option.merge({b: true});
      assert.strictEqual(true, option.value.b);
      option.reset();
      assert.strictEqual(false, option.value.b);
    });
  });

  it('is immutable', function() {
    var option = new Options({a: true, b: false});
    option.foo = 2;
    assert.strictEqual('undefined', typeof option.foo);
  });
});
