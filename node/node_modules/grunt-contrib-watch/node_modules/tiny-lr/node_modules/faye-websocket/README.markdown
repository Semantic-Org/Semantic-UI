# faye-websocket

* Travis CI build: [<img src="https://secure.travis-ci.org/faye/faye-websocket-node.png" />](http://travis-ci.org/faye/faye-websocket-node)
* Autobahn tests: [server](http://faye.jcoglan.com/autobahn/servers/), [client](http://faye.jcoglan.com/autobahn/clients/)

This is a robust, general-purpose WebSocket implementation extracted from the
[Faye](http://faye.jcoglan.com) project. It provides classes for easily building
WebSocket servers and clients in Node. It does not provide a server itself, but
rather makes it easy to handle WebSocket connections within an existing
[Node](http://nodejs.org/) application. It does not provide any abstraction
other than the standard [WebSocket API](http://dev.w3.org/html5/websockets/).

It also provides an abstraction for handling [EventSource](http://dev.w3.org/html5/eventsource/)
connections, which are one-way connections that allow the server to push data to
the client. They are based on streaming HTTP responses and can be easier to
access via proxies than WebSockets.

The server-side socket can process [draft-75](http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-75),
[draft-76](http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76),
[hybi-07](http://tools.ietf.org/html/draft-ietf-hybi-thewebsocketprotocol-07)
and later versions of the protocol. It selects protocol versions automatically,
supports both `text` and `binary` messages, and transparently handles `ping`,
`pong`, `close` and fragmented messages.


## Handling WebSocket connections in Node

You can handle WebSockets on the server side by listening for HTTP Upgrade
requests, and creating a new socket for the request. This socket object exposes
the usual WebSocket methods for receiving and sending messages. For example this
is how you'd implement an echo server:

```js
var WebSocket = require('faye-websocket'),
    http      = require('http');

var server = http.createServer();

server.addListener('upgrade', function(request, socket, head) {
  var ws = new WebSocket(request, socket, head);
  
  ws.onmessage = function(event) {
    ws.send(event.data);
  };
  
  ws.onclose = function(event) {
    console.log('close', event.code, event.reason);
    ws = null;
  };
});

server.listen(8000);
```

Note that under certain circumstances (notably a draft-76 client connecting
through an HTTP proxy), the WebSocket handshake will not be complete after you
call `new WebSocket()` because the server will not have received the entire
handshake from the client yet. In this case, calls to `ws.send()` will buffer
the message in memory until the handshake is complete, at which point any
buffered messages will be sent to the client.

If you need to detect when the WebSocket handshake is complete, you can use the
`onopen` event.

If the connection's protocol version supports it, you can call `ws.ping()` to
send a ping message and wait for the client's response. This method takes a
message string, and an optional callback that fires when a matching pong message
is received. It returns `true` iff a ping message was sent. If the client does
not support ping/pong, this method sends no data and returns `false`.

```js
ws.ping('Mic check, one, two', function() {
  // fires when pong is received
});
```


## Using the WebSocket client

The client supports both the plain-text `ws` protocol and the encrypted `wss`
protocol, and has exactly the same interface as a socket you would use in a web
browser. On the wire it identifies itself as hybi-13.

```js
var WebSocket = require('faye-websocket'),
    ws        = new WebSocket.Client('ws://www.example.com/');

ws.onopen = function(event) {
  console.log('open');
  ws.send('Hello, world!');
};

ws.onmessage = function(event) {
  console.log('message', event.data);
};

ws.onclose = function(event) {
  console.log('close', event.code, event.reason);
  ws = null;
};
```


## Subprotocol negotiation

The WebSocket protocol allows peers to select and identify the application
protocol to use over the connection. On the client side, you can set which
protocols the client accepts by passing a list of protocol names when you
construct the socket:

```js
var ws = new WebSocket.Client('ws://www.example.com/', ['irc', 'amqp']);
```

On the server side, you can likewise pass in the list of protocols the server
supports after the other constructor arguments:

```js
var ws = new WebSocket(request, socket, head, ['irc', 'amqp']);
```

If the client and server agree on a protocol, both the client- and server-side
socket objects expose the selected protocol through the `ws.protocol` property.
If they cannot agree on a protocol to use, the client closes the connection.


## WebSocket API

The WebSocket API consists of several event handlers and a method for sending
messages.

* <b><tt>onopen</tt></b> fires when the socket connection is established. Event
  has no attributes.
* <b><tt>onerror</tt></b> fires when the connection attempt fails. Event has no
  attributes.
* <b><tt>onmessage</tt></b> fires when the socket receives a message. Event has
  one attribute, <b><tt>data</tt></b>, which is either a `String` (for text
  frames) or a `Buffer` (for binary frames).
* <b><tt>onclose</tt></b> fires when either the client or the server closes the
  connection. Event has two optional attributes, <b><tt>code</tt></b> and
  <b><tt>reason</tt></b>, that expose the status code and message sent by the
  peer that closed the connection.
* <b><tt>send(message)</tt></b> accepts either a `String` or a `Buffer` and
  sends a text or binary message over the connection to the other peer.
* <b><tt>close(code, reason)</tt></b> closes the connection, sending the given
  status code and reason text, both of which are optional.
* <b><tt>protocol</tt></b> is a string (which may be empty) identifying the
  subprotocol the socket is using.


## Handling EventSource connections in Node

EventSource connections provide a very similar interface, although because they
only allow the server to send data to the client, there is no `onmessage` API.
EventSource allows the server to push text messages to the client, where each
message has an optional event-type and ID.

```js
var WebSocket   = require('faye-websocket'),
    EventSource = WebSocket.EventSource,
    http        = require('http');

var server = http.createServer();

server.addListener('request', function(request, response) {
  if (EventSource.isEventSource(request)) {
    var es = new EventSource(request, response);
    console.log('open', es.url, es.lastEventId);
    
    // Periodically send messages
    var loop = setInterval(function() { es.send('Hello') }, 1000);
    
    es.onclose = function() {
      clearInterval(loop);
      es = null;
    };
  
  } else {
    // Normal HTTP request
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.write('Hello');
    response.end();
  }
});

server.listen(8000);
```

The `send` method takes two optional parameters, `event` and `id`. The default
event-type is `'message'` with no ID. For example, to send a `notification`
event with ID `99`:

```js
es.send('Breaking News!', {event: 'notification', id: '99'});
```

The `EventSource` object exposes the following properties:

* <b><tt>url</tt></b> is a string containing the URL the client used to create
  the EventSource.
* <b><tt>lastEventId</tt></b> is a string containing the last event ID
  received by the client. You can use this when the client reconnects after a
  dropped connection to determine which messages need resending.

When you initialize an EventSource with ` new EventSource()`, you can pass
configuration options after the `response` parameter. Available options are:

* <b><tt>retry</tt></b> is a number that tells the client how long (in seconds)
  it should wait after a dropped connection before attempting to reconnect.
* <b><tt>ping</tt></b> is a number that tells the server how often (in seconds)
  to send 'ping' packets to the client to keep the connection open, to defeat
  timeouts set by proxies. The client will ignore these messages.

For example, this creates a connection that pings every 15 seconds and is
retryable every 10 seconds if the connection is broken:

```js
var es = new EventSource(request, response, {ping: 15, retry: 10});
```

You can send a ping message at any time by calling `es.ping()`. Unlike WebSocket,
the client does not send a response to this; it is merely to send some data over
the wire to keep the connection alive.


## License

(The MIT License)

Copyright (c) 2009-2013 James Coglan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

