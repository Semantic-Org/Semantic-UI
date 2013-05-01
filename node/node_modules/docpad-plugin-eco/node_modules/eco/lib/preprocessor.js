(function() {
  var Preprocessor, Scanner, util;

  Scanner = require("./scanner");

  util = require("./util");

  module.exports = Preprocessor = (function() {

    Preprocessor.preprocess = function(source) {
      var preprocessor;
      preprocessor = new Preprocessor(source);
      return preprocessor.preprocess();
    };

    function Preprocessor(source) {
      this.scanner = new Scanner(source);
      this.output = "";
      this.level = 0;
      this.options = {};
      this.captures = [];
    }

    Preprocessor.prototype.preprocess = function() {
      var _this = this;
      while (!this.scanner.done) {
        this.scanner.scan(function(token) {
          return _this[token[0]].apply(_this, token.slice(1));
        });
      }
      return this.output;
    };

    Preprocessor.prototype.record = function(line) {
      this.output += util.repeat("  ", this.level);
      return this.output += line + "\n";
    };

    Preprocessor.prototype.printString = function(string) {
      if (string.length) {
        return this.record("__out.push " + (util.inspectString(string)));
      }
    };

    Preprocessor.prototype.beginCode = function(options) {
      return this.options = options;
    };

    Preprocessor.prototype.recordCode = function(code) {
      if (code !== "end") {
        if (this.options.print) {
          if (this.options.safe) {
            return this.record("__out.push " + code);
          } else {
            return this.record("__out.push __sanitize " + code);
          }
        } else {
          return this.record(code);
        }
      }
    };

    Preprocessor.prototype.indent = function(capture) {
      this.level++;
      if (capture) {
        this.record("__capture " + capture);
        this.captures.unshift(this.level);
        return this.indent();
      }
    };

    Preprocessor.prototype.dedent = function() {
      this.level--;
      if (this.level < 0) this.fail("unexpected dedent");
      if (this.captures[0] === this.level) {
        this.captures.shift();
        return this.dedent();
      }
    };

    Preprocessor.prototype.fail = function(message) {
      throw "Parse error on line " + this.scanner.lineNo + ": " + message;
    };

    return Preprocessor;

  })();

}).call(this);
