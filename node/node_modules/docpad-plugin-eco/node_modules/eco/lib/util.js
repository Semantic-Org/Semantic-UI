(function() {
  var repeat, specialCharacters;

  exports.repeat = repeat = function(string, count) {
    return Array(count + 1).join(string);
  };

  exports.indent = function(string, width) {
    var line, lines, space;
    space = repeat(" ", width);
    lines = (function() {
      var _i, _len, _ref, _results;
      _ref = string.split("\n");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(space + line);
      }
      return _results;
    })();
    return lines.join("\n");
  };

  exports.trim = function(string) {
    return string.replace(/^\s+/, "").replace(/\s+$/, "");
  };

  specialCharacters = {
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t'
  };

  exports.inspectString = function(string) {
    var contents;
    contents = string.replace(/[\x00-\x1f\\]/g, function(character) {
      var code;
      if (character in specialCharacters) {
        return specialCharacters[character];
      } else {
        code = character.charCodeAt(0).toString(16);
        if (code.length === 1) code = "0" + code;
        return "\\u00" + code;
      }
    });
    return "'" + contents.replace(/'/g, '\\\'') + "'";
  };

}).call(this);
