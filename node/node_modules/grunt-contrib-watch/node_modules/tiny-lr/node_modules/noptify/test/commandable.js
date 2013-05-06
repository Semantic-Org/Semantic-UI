var noptify = require('..');
var assert  = require('assert');

describe('Commandable', function() {

  it('provides the .command() utility', function() {
    assert.ok(typeof noptify().command === 'function');
  });


  describe('Parses remaining arguments and route to the appropriate command', function() {

    it('can be a simple function', function(done) {
      var program = noptify(['', '', 'init', '--debug', 'foo']).option('debug', 'an option');

      program.command('init', function(args, opts) {
        // args ==> sliced args at command position
        // opts ==> nopt parsed object
        assert.deepEqual(args, ['--debug', 'foo']);
        assert.equal(opts.debug, true);
        assert.equal(opts.argv.remain[0], 'foo');
        done();
      });

      program.parse();
    });

    it('or another program, an Noptify instance', function(done) {
      var args = ['', '', 'init', '--debug', 'myapp', 'foo'];

      var init = noptify(args)
        .option('debug', 'Debug output')
        .command('myapp', done.bind(null, null));

      noptify(args).command('init', init).parse();
    });
  });


});
