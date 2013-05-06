var noptify = require('..');
var assert  = require('assert');

describe('API', function() {

  it('returns an instanceof Noptify', function() {
    assert.ok(noptify() instanceof noptify.Noptify);
  });


  it('is typically used like so', function() {
    var program = noptify(['node', 'file.js', '-d', '--dirname', './', '-p', '3000', 'app.js', 'base.js'])
      .option('debug', '-d', 'Enabled debug output', Boolean)
      .option('dirname', 'The path to the output directory')
      .option('port', '-p', 'The port you wish to listen on', Number)

    // opts => nopt result
    var opts = program.parse();

    assert.deepEqual(opts, {
      port: 3000,
      debug: true,
      dirname: './',
      argv: {
        remain: ['app.js', 'base.js'],
        cooked: ['--debug', '--dirname', './', '--port', '3000', 'app.js', 'base.js'],
        original: ['-d', '--dirname', './', '-p', '3000', 'app.js', 'base.js']
      }
    });
  });

  it('allows definitiion of shorthands separately', function() {
    var opts = noptify(['node', 'file.js', '-lc'])
      .option('line-comment', 'Ouputs with debugging information', Boolean)
      .shorthand('lc', '--line-comment')
      .parse();

    assert.equal(opts['line-comment'], true);
  });

  // hmm, keep this one for the very last, or do another way, process exit
  // prevent other tests from running
  it.skip('outputs help and exit the process with --help', function() {
    var program = noptify(['', '', '--help'])
    assert.throws(function() {
      throw new Error('parse() must be called for this to happen');
    });

    program.parse();
    throw new Error('I\'m sad, I\'ll never throw :(');
  });

});
