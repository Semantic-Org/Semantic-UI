(function() {
  var Scanner, StringScanner, trim;

  StringScanner = require("strscan").StringScanner;

  trim = require("./util").trim;

  module.exports = Scanner = (function() {

    Scanner.modePatterns = {
      data: /(.*?)(<%%|<%\s*(\#)|<%(([=-])?)|\n|$)/,
      code: /(.*?)((((:|(->|=>))\s*))?%>|\n|$)/,
      comment: /(.*?)(%>|\n|$)/
    };

    Scanner.dedentablePattern = /^(end|when|else|catch|finally)(?:\W|$)/;

    Scanner.scan = function(source) {
      var scanner, tokens;
      tokens = [];
      scanner = new Scanner(source);
      while (!scanner.done) {
        scanner.scan(function(token) {
          return tokens.push(token);
        });
      }
      return tokens;
    };

    function Scanner(source) {
      this.source = source.replace(/\r\n?/g, "\n");
      this.scanner = new StringScanner(this.source);
      this.mode = "data";
      this.buffer = "";
      this.lineNo = 1;
      this.done = false;
    }

    Scanner.prototype.scan = function(callback) {
      if (this.done) {
        return callback();
      } else if (this.scanner.hasTerminated()) {
        this.done = true;
        switch (this.mode) {
          case "data":
            return callback(["printString", this.flush()]);
          case "code":
            return callback(["fail", "unexpected end of template"]);
        }
      } else {
        this.advance();
        switch (this.mode) {
          case "data":
            return this.scanData(callback);
          case "code":
            return this.scanCode(callback);
          case "comment":
            return this.scanComment(callback);
        }
      }
    };

    Scanner.prototype.advance = function() {
      this.scanner.scanUntil(Scanner.modePatterns[this.mode]);
      this.buffer += this.scanner.getCapture(0);
      this.tail = this.scanner.getCapture(1);
      this.comment = this.scanner.getCapture(2);
      this.directive = this.scanner.getCapture(4);
      return this.arrow = this.scanner.getCapture(5);
    };

    Scanner.prototype.scanData = function(callback) {
      if (this.tail === "<%%") {
        this.buffer += "<%";
        return this.scan(callback);
      } else if (this.tail === "\n") {
        this.buffer += this.tail;
        this.lineNo++;
        return this.scan(callback);
      } else if (this.tail) {
        callback(["printString", this.flush()]);
        if (this.comment) {
          return this.mode = "comment";
        } else {
          this.mode = "code";
          return callback([
            "beginCode", {
              print: this.directive != null,
              safe: this.directive === "-"
            }
          ]);
        }
      }
    };

    Scanner.prototype.scanCode = function(callback) {
      var code;
      if (this.tail === "\n") {
        return callback(["fail", "unexpected newline in code block"]);
      } else if (this.tail) {
        this.mode = "data";
        code = trim(this.flush());
        if (this.arrow) code += " " + this.arrow;
        if (this.isDedentable(code)) callback(["dedent"]);
        callback(["recordCode", code]);
        if (this.directive) return callback(["indent", this.arrow]);
      }
    };

    Scanner.prototype.scanComment = function(callback) {
      if (this.tail === "\n") {
        return callback(["fail", "unexpected newline in code block"]);
      } else if (this.tail) {
        this.mode = "data";
        return this.buffer = "";
      }
    };

    Scanner.prototype.flush = function() {
      var buffer;
      buffer = this.buffer;
      this.buffer = "";
      return buffer;
    };

    Scanner.prototype.isDedentable = function(code) {
      return code.match(Scanner.dedentablePattern);
    };

    return Scanner;

  })();

}).call(this);
