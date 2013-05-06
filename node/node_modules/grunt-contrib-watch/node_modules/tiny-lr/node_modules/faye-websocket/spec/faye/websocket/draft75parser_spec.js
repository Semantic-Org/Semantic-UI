var Draft75Parser = require('../../../lib/faye/websocket/draft75_parser')

JS.ENV.Draft75ParserSpec = JS.Test.describe("Draft75Parser", function() { with(this) {
  before(function() { with(this) {
    this.webSocket = {dispatchEvent: function() {}}
    this.parser = new Draft75Parser(webSocket)
  }})

  describe("parse", function() { with(this) {
    sharedBehavior("draft-75 parser", function() { with(this) {
      it("parses text frames", function() { with(this) {
        expect(webSocket, "receive").given("Hello")
        parser.parse([0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff])
      }})

      it("parses multiple frames from the same packet", function() { with(this) {
        expect(webSocket, "receive").given("Hello").exactly(2)
        parser.parse([0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff])
      }})

      it("parses text frames beginning 0x00-0x7F", function() { with(this) {
        expect(webSocket, "receive").given("Hello")
        parser.parse([0x66, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff])
      }})

      it("ignores frames with a length header", function() { with(this) {
        expect(webSocket, "receive").exactly(0)
        parser.parse([0x80, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f])
      }})

      it("parses text following an ignored block", function() { with(this) {
        expect(webSocket, "receive").given("Hello")
        parser.parse([0x80, 0x02, 0x48, 0x65, 0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff])
      }})

      it("parses multibyte text frames", function() { with(this) {
        expect(webSocket, "receive").given("Apple = ")
        parser.parse([0x00, 0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf, 0xff])
      }})

      it("parses frames received in several packets", function() { with(this) {
        expect(webSocket, "receive").given("Apple = ")
        parser.parse([0x00, 0x41, 0x70, 0x70, 0x6c, 0x65])
        parser.parse([0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf, 0xff])
      }})

      it("parses fragmented frames", function() { with(this) {
        expect(webSocket, "receive").given("Hello")
        parser.parse([0x00, 0x48, 0x65, 0x6c])
        parser.parse([0x6c, 0x6f, 0xff])
      }})
    }})

    behavesLike("draft-75 parser")

    it("does not close the socket if a 76 close frame is received", function() { with(this) {
      expect(webSocket, "close").exactly(0)
      expect(webSocket, "receive").given("")
      parser.parse([0xFF, 0x00])
    }})
  }})

  describe("frame", function() { with(this) {
    it("returns the given string formatted as a WebSocket frame", function() { with(this) {
      assertBufferEqual( [0x00, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0xff], parser.frame("Hello") )
    }})

    it("encodes multibyte characters correctly", function() { with(this) {
      assertBufferEqual( [0x00, 0x41, 0x70, 0x70, 0x6c, 0x65, 0x20, 0x3d, 0x20, 0xef, 0xa3, 0xbf, 0xff], parser.frame("Apple = ") )
    }})
  }})
}})
