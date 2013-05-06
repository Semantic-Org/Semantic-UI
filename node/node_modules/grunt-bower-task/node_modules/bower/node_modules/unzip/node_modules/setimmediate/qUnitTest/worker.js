importScripts("../setImmediate.js");

setImmediate(function () {
	self.postMessage("TEST");
});