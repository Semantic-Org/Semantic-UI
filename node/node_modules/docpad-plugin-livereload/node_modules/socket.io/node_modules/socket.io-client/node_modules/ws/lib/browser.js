/// shim for browser packaging

module.exports = function() {
  return global.WebSocket || global.MozWebSocket;
}
