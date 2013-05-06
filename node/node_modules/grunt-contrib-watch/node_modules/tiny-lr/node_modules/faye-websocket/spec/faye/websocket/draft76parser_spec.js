var Draft76Parser = require('../../../lib/faye/websocket/draft76_parser')

JS.ENV.Draft76ParserSpec = JS.Test.describe("Draft76Parser", function() { with(this) {
  before(function() { with(this) {
    this.webSocket = {dispatchEvent: function() {}}
    this.parser = new Draft76Parser(webSocket)
    parser._handshakeComplete = true
  }})

  describe("parse", function() { with(this) {
    behavesLike("draft-75 parser")

    it("closes the socket if a close frame is received", function() { with(this) {
      expect(webSocket, "close")
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
