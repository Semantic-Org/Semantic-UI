var HybiParser = require('../../../lib/faye/websocket/hybi_parser')

JS.ENV.HybiParserSpec = JS.Test.describe("HybiParser", function() { with(this) {
  before(function() { with(this) {
    this.webSocket = {dispatchEvent: function() {}}
    this.parser = new HybiParser(webSocket)
  }})

  define("parse", function() {
    var bytes = [];
    for (var i = 0, n = arguments.length; i < n; i++) bytes = bytes.concat(arguments[i])
    this.parser.parse(new Buffer(bytes))
  })

  define("buffer", function(string) {
    return {
      equals: function(buffer) {
        return buffer.toString('utf8', 0, buffer.length) === string
      }
    }
  })

  describe("parse", function() { with(this) {
    define("mask", function() {
      return this._mask = this._mask || [1,2,3,4].map(function() { return Math.floor(Math.random() * 255) })
    })

    define("maskMessage", function(bytes) {
      var output = []
      Array.prototype.forEach.call(bytes, function(b, i) {
        output[i] = bytes[i] ^ this.mask()[i % 4]
      }, this)
      return output
    })

    it("parses unmasked text frames", function() { with(this) {
      expect(webSocket, "receive").given("Hello")
      parse([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
    }})

    it("parses multiple frames from the same packet", function() { with(this) {
      expect(webSocket, "receive").given("Hello").exactly(2)
      parse([0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
    }})

    it("parses empty text frames", function() { with(this) {
      expect(webSocket, "receive").given("")
      parse([0x81, 0x00])
    }})

    it("parses fragmented text frames", function() { with(this) {
      expect(webSocket, "receive").given("Hello")
      parse([0x01, 0x03, 0x48, 0x65, 0x6c])
      parse([0x80, 0x02, 0x6c, 0x6f])
    }})

    it("parses masked text frames", function() { with(this) {
      expect(webSocket, "receive").given("Hello")
      parse([0x81, 0x85], mask(), maskMessage([0x48, 0x65, 0x6c, 0x6c, 0x6f]))
    }})

    it("parses masked empty text frames", function() { with(this) {
      expect(webSocket, "receive").given("")
      parse([0x81, 0x80], mask(), maskMessage([]))
    }})

    it("parses masked fragmented text frames", function() { with(this) {
      expect(webSocket, "receive").given("Hello")
      parse([0x01, 0x81], mask(), maskMessage([0x48]))
      parse([0x80, 0x84], mask(), maskMessage([0x65, 0x6c, 0x6c, 0x6f]))
    }})

    it("closes the socket if the frame has an unrecognized opcode", function() { with(this) {
      expect(webSocket, "close").given(1002, null, false)
      parse([0x83, 0x00])
    }})

    it("closes the socket if a close frame is received", function() { with(this) {
      expect(webSocket, "close").given(1000, "Hello", false)
      parse([0x88, 0x07, 0x03, 0xe8, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
    }})

    it("parses unmasked multibyte text frames", function() { with(this) {
      expect(webSocket, "receive").given("Apple = ")
      parse([0x81, 0x0b, 0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf])
    }})

    it("parses frames received in several packets", function() { with(this) {
      expect(webSocket, "receive").given("Apple = ")
      parse([0x81, 0x0b, 0x41, 0x70, 0x70, 0x6c])
      parse([0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf])
    }})

    it("parses fragmented multibyte text frames", function() { with(this) {
      expect(webSocket, "receive").given("Apple = ")
      parse([0x01, 0x0a, 0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3])
      parse([0x80, 0x01, 0xbf])
    }})

    it("parses masked multibyte text frames", function() { with(this) {
      expect(webSocket, "receive").given("Apple = ")
      parse([0x81, 0x8b], mask(), maskMessage([0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf]))
    }})

    it("parses masked fragmented multibyte text frames", function() { with(this) {
      expect(webSocket, "receive").given("Apple = ")
      parse([0x01, 0x8a], mask(), maskMessage([0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3]))
      parse([0x80, 0x81], mask(), maskMessage([0xbf]))
    }})

    it("parses unmasked medium-length text frames", function() { with(this) {
      expect(webSocket, "receive").given("HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello")
      parse([129, 126, 0, 200, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111])
    }})

    it("parses masked medium-length text frames", function() { with(this) {
      expect(webSocket, "receive").given("HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello")
      parse([129, 254, 0, 200], mask(), maskMessage([72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111]))
    }})

    it("replies to pings with a pong", function() { with(this) {
      expect(webSocket, "send").given(buffer("OHAI"), "pong")
      parse([0x89, 0x04, 0x4f, 0x48, 0x41, 0x49])
    }})
  }})

  describe("frame", function() { with(this) {
    it("returns the given string formatted as a WebSocket frame", function() { with(this) {
      assertBufferEqual( [0x81, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f], parser.frame("Hello") )
    }})

    it("encodes multibyte characters correctly", function() { with(this) {
      assertBufferEqual( [0x81, 0x0b, 0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf], parser.frame("Apple = ") )
    }})

    it("encodes medium-length strings using extra length bytes", function() { with(this) {
      assertBufferEqual( [129, 126, 0, 200, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111, 72, 101, 108, 108, 111], parser.frame("HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello") )
    }})

    it("encodes close frames with an error code", function() { with(this) {
      assertBufferEqual( [0x88, 0x07, 0x03, 0xea, 0x48, 0x65, 0x6c, 0x6c, 0x6f], parser.frame("Hello", "close", 1002) )
    }})

    it("encodes pong frames", function() { with(this) {
      assertBufferEqual( [0x8a, 0x00], parser.frame("", "pong") )
    }})
  }})
}})
