### noptify

noptify is a little wrapper around `nopt` module adding a more expressive,
commander-like, API and few helpers.

Examples

     var program = noptify(process.argv, { program: 'name' })
       .version('0.0.1')
       .option('port', '-p', 'Port to listen on (default: 35729)', Number)
       .option('pid', 'Path to the generated PID file', String)

     var opts = program.parse();

Returns an instance of `Noptify`

### Noptify

Noptify provides the API to parse out option, shorthands and generate the
proper generic help output.

- args     - The Array of arguments to parse (default: `process.argv`);
- options  - An hash of options with the following properties
  - program - The program name to use in usage output

Every noptify instance is created with two options, `-h, --help` and `-v,
--version`.

### Noptify#parse

Parse the provided options and shorthands, pass them through `nopt` and
return the result.

When `opts.help` is set, the help output is displayed and `help`
event is emitted. The process exists with `0` status, the help output is
automatically displayed and the `help` event is emitted.

Examples

    var program = noptify(['foo', '--help'])
      .on('help', function() {
        console.log('Examples');
        console.log('');
        console.log('  foo bar --baz > foo.txt');
      });

    var opts = program.parse();
    // ... Help output ...
    // ... Custom help output ...
    // ... Exit ...



### Noptify#version

Define the program version.

### Noptify#option

Define `name` option with optional shorthands, optional description and optional type.

### Noptify#help

Simply output to stdout the Usage and Help output.

---

*Mocha generated documentation*

- [API](#api)
- [Collectable](#collectable)
- [Commandable](#commandable)
  - [Parses remaining arguments and route to the appropriate command](#commandable-parses-remaining-arguments-and-route-to-the-appropriate-command)

<a name=""></a>

<a name="api"></a>
## API
returns an instanceof Noptify.

```js
assert.ok(noptify() instanceof noptify.Noptify);
```

is typically used like so.

```js
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
```

allows definitiion of shorthands separately.

```js
var opts = noptify(['node', 'file.js', '-lc'])
  .option('line-comment', 'Ouputs with debugging information', Boolean)
  .shorthand('lc', '--line-comment')
  .parse();

assert.equal(opts['line-comment'], true);
```

<a name="collectable"></a>
## Collectable
provides the helper method to read from stdin.

```js
var program = noptify();
assert.ok(typeof program.stdin === 'function', 'stdin defined');
```

is invoked only when .parse() is called.

```js
var program = noptify(['', '']);
var str = 'testing out stdin helper';
program.stdin(function(err, res) {
  assert.equal(res, str);
  done();
});

program.parse();

process.nextTick(function() {
  process.stdin.emit('data', str);
  process.stdin.emit('end');
});
```

<a name="commandable"></a>
## Commandable
provides the .command() utility.

```js
assert.ok(typeof noptify().command === 'function');
```

<a name="commandable-parses-remaining-arguments-and-route-to-the-appropriate-command"></a>
## Parses remaining arguments and route to the appropriate command
can be a simple function.

```js
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
```

or another program, an Noptify instance.

```js
var args = ['', '', 'init', '--debug', 'myapp', 'foo'];

var init = noptify(args)
  .option('debug', 'Debug output')
  .command('myapp', done.bind(null, null));

noptify(args).command('init', init).parse();
```

