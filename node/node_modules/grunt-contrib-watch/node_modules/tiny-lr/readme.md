tiny-lr
-------

This script manages a tiny [LiveReload](http://livereload.com/) server
implementation you can spawn in the background.

It exposes:

- a background-friendly bin wrapper (thanks to
  [@FGRibreau](https://github.com/FGRibreau) [pid.js
  gist](https://gist.github.com/1846952))

- [Grunt tasks](https://github.com/mklabs/tiny-lr#using-grunt) to start the server and trigger reload notification. Every task
  name is prefixed by `tinylr-`.

- [Generic targets](https://github.com/mklabs/tiny-lr#using-make) to include in
  your Makefile (`include node_modules/tiny-lr/tasks/tiny-lr.mk`)

It doesn't have any watch ability, it must be done at the build process or
application level.

Instead, it exposes a very simple API to notify the server that some
changes have been made, that is then broadcasted to every livereload client
connected.

    # notify a single change
    curl http://localhost:35729/changed?files=style.css

    # notify using a longer path
    curl http://localhost:35729/changed?files=js/app.js

    # notify multiple changes, comma or space delimited
    curl http://localhost:35729/changed?files=index.html,style.css,docs/docco.css

Or you can bulk the information into a POST request, with body as a JSON array of files.

    curl -X POST http://localhost:35729/changed -d '{ "files": ["style.css", "app.js"] }'

As for the livereload client, you need to install the browser extension:
http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions-
(**note**: you need to listen on port 35729 to be able to use with your
brower extension)

or add the livereload script tag manually:
http://feedback.livereload.com/knowledgebase/articles/86180-how-do-i-add-the-script-tag-manually-
(and here you can choose whatever port you want)

## Integration

This package exposes a `bin` you can decide to install globally, but it's not recommended.

    tiny-lr --help

    Usage: tiny-lr [options]

    Options:
      -h, --help        - Show help usage
      -v, --version     - Show package version
      -p, --port        - Port to listen on (default: 35729)
      --pid             - Path to the generated PID file (default: ./tiny-lr.pid)


The best way to integrate the runner in your workflow is to add it as a `reload`
step within your build tool. This build tool can then use the internal binary
linked by npm in `node_modules/.bin/tiny-lr` to not rely on global installs (or
use the server programmtically).

You can start the server using the binary provided, or use your own start script.

```js
var tinylr = require('tiny-lr');

// standard LiveReload port
var port = 35729;

// tinylr(opts) => new tinylr.Server(opts);
tinylr().listen(port, function() {
  if(err) {
    // deal with err
    return;
  }

  console.log('... Listening on %s (pid: %s) ...', port);
})
```

You can define your own route and listen for specific request:

```js
var server = tinylr();

server.on('GET /myplace', function(req, res) {
  res.write('Mine');
  res.end();
})
```

And stop the server manually:

```js
server.close();
```

This will close any websocket connection established and emit a close event.

### Middleware

To use as a connect / express middleware, tiny-lr needs query /
bodyParse middlewares prior in the stack.

Any handled requests ends at the tinylr level, not found and errors are
nexted to the rest of the stack.

```js
// This binds both express app and tinylr on the same port
var app = express();
app.use(express.query())
  .use(express.bodyParser())
  .use(tinylr.middleware({ app: app }))
  .use(express.static(path.resolve('./')))
  .use(express.directory(path.resolve('./')))
  .listen(35729, function() {
    console.log('Listening on %d', 35729);
  })
```

The port you listen on is important, and tinylr should **always** listen on
the LiveReload standard one: `35729`. Otherwise, you won't be able to rely
on the browser extensions, though you can still use the manual snippet
approach.

You can also start two different servers, one on your app port, the
other listening on the LiveReload port. Check the
`examples/express/server.js` file to see how.

### Using grunt

This package exposes a `tasks/` directory, that you can use within your Gruntfile with:

```js
grunt.loadNpmTasks('tiny-lr');
```

- tinylr-start    - Starts a new tiny-lr Server, with the provided port.
- tinylr-reload   - Sends a reload notification to the previously started server.

`tinylr-start` should be used with the `watch` task, probably with an alias
that triggers both `tinylr-start watch` tasks.

`tinylr-reload` should be configured as a "watch" task in your Gruntfile.

```js
grunt.initConfig({
  watch: {
    reload: {
      files: ['**/*.html', '**/*.js', '**/*.css', '**/*.{png,jpg}'],
      tasks: 'tinylr-reload'
    }
  }
});

grunt.registerTask('reload', 'tinylr-start watch');
```


### Using make

See `tasks/tiny-lr.mk`.

Include this file into your project Makefile to bring in the following targets:

- start 						- Start the LiveReload server
- stop 							- Stops the LiveReload server
- livereload 				- alias to start
- livereload-stop 	- aias to stop

Then define your "empty" targets, and the list of files you want to monitor.

```make
CSS_DIR = app/styles
CSS_FILES = $(shell find $(CSS_DIR) -name '*.css')

# include the livereload targets
include node_modules/tiny-lr/tasks/*.mk

$(CSS_DIR): $(CSS_FILES)
  @echo CSS files changed: $?
    @touch $@
  curl -X POST http://localhost:35729/changed -d '{ "files": "$?" }'

reload-css: livereload $(CSS_DIR)

.PHONY: reload-css
```

The pattern is always the same:

- define a target for your root directory that triggers a POST request
- `touch` the directory to update its mtime
- add reload target with `livereload` and the list of files to "watch" as
  prerequisites

You can chain multiple "reload" targets in a single one:

```make
reload: reload-js reload-css reload-img reload-EVERYTHING
```

Combine this with [visionmedia/watch](https://github.com/visionmedia/watch) and
you have a livereload environment.

    watch make reload

    # add a -q flag to the watch command to suppress most of the annoying output
    watch -q reload

The `-q` flag only outputs STDERR, you can in your Makefile redirect the
output of your commands to `>&2` to see them in `watch -q` mode.


## Tests

    npm test

---


# TOC
   - [tiny-lr](#tiny-lr)
     - [GET /](#tiny-lr-get-)
     - [GET /changed](#tiny-lr-get-changed)
     - [POST /changed](#tiny-lr-post-changed)
     - [GET /livereload.js](#tiny-lr-get-livereloadjs)
     - [GET /kill](#tiny-lr-get-kill)
<a name="" />

<a name="tiny-lr" />
# tiny-lr
accepts ws clients.

```js
var url = parse(this.request.url);
var server = this.app;

var ws = this.ws = new WebSocket('ws://' + url.host + '/livereload');

ws.onopen = function(event) {
  var hello = {
    command: 'hello',
    protocols: ['http://livereload.com/protocols/official-7']
  };

  ws.send(JSON.stringify(hello));
};

ws.onmessage = function(event) {
  assert.deepEqual(event.data, JSON.stringify({
    command: 'hello',
    protocols: ['http://livereload.com/protocols/official-7'],
    serverName: 'tiny-lr'
  }));

  assert.ok(Object.keys(server.clients).length);
  done();
};
```

properly cleans up established connection on exit.

```js
var ws = this.ws;

ws.onclose = done.bind(null, null);

request(this.server)
  .get('/kill')
  .expect(200, function() {
    console.log('server shutdown');
  });
```

<a name="tiny-lr" />
# tiny-lr
<a name="tiny-lr-get-" />
## GET /
respond with nothing, but respond.

```js
request(this.server)
  .get('/')
  .expect('Content-Type', /json/)
  .expect('{"tinylr":"Welcome","version":"0.0.1"}')
  .expect(200, done);
```

unknown route respond with proper 404 and error message.

```js
request(this.server)
  .get('/whatev')
  .expect('Content-Type', /json/)
  .expect('{"error":"not_found","reason":"no such route"}')
  .expect(404, done);
```

<a name="tiny-lr-get-changed" />
## GET /changed
with no clients, no files.

```js
request(this.server)
  .get('/changed')
  .expect('Content-Type', /json/)
  .expect(/"clients":\[\]/)
  .expect(/"files":\[\]/)
  .expect(200, done);
```

with no clients, some files.

```js
request(this.server)
  .get('/changed?files=gonna.css,test.css,it.css')
  .expect('Content-Type', /json/)
  .expect('{"clients":[],"files":["gonna.css","test.css","it.css"]}')
  .expect(200, done);
```

<a name="tiny-lr-post-changed" />
## POST /changed
with no clients, no files.

```js
request(this.server)
  .post('/changed')
  .expect('Content-Type', /json/)
  .expect(/"clients":\[\]/)
  .expect(/"files":\[\]/)
  .expect(200, done);
```

with no clients, some files.

```js
var data = { clients: [], files: ['cat.css', 'sed.css', 'ack.js'] };

request(this.server)
  .post('/changed')
  .send({ files: data.files })
  .expect('Content-Type', /json/)
  .expect(JSON.stringify(data))
  .expect(200, done);
```

<a name="tiny-lr-get-livereloadjs" />
## GET /livereload.js
respond with livereload script.

```js
request(this.server)
  .get('/livereload.js')
  .expect(/LiveReload/)
  .expect(200, done);
```

<a name="tiny-lr-get-kill" />
## GET /kill
shutdown the server.

```js
var server = this.server;
request(server)
  .get('/kill')
  .expect(200, function(err) {
    if(err) return done(err);
    assert.ok(!server._handle);
    done();
  });
```

---

- 2013-01-21 - v0.0.4 - middleware support
- 2013-01-20 - v0.0.3 - serve livereload from repo (#4)
- 2013-01-12 - v0.0.2 - tasks - support for grunt 0.3.x (#1)
- 2013-01-05 - v0.0.1 - Initial release
