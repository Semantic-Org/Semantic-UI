(function() {
  var Node, Typenames, Types, exports, narcissus, parser, tokens, _,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = [].slice;

  narcissus = require('./narcissus_packed');

  _ = require('underscore');

  tokens = narcissus.definitions.tokens;

  parser = narcissus.parser;

  Node = parser.Node;

  Node.prototype.left = function() {
    return this.children[0];
  };

  Node.prototype.right = function() {
    return this.children[1];
  };

  Node.prototype.last = function() {
    return this.children[this.children.length - 1];
  };

  Node.prototype.walk = function(options, fn, parent, list) {
    if (parent == null) {
      parent = null;
    }
    if (list == null) {
      list = null;
    }
    if (parent) {
      fn(parent, this, list);
    }
    if (options.last) {
      if (this.last() != null) {
        this.last().walk(options, fn, this);
      }
    }
    if (this.thenPart != null) {
      this.thenPart.walk(options, fn, this, 'thenPart');
    }
    if (this.elsePart != null) {
      this.elsePart.walk(options, fn, this, 'elsePart');
    }
    if (this.cases) {
      return _.each(this.cases, function(item) {
        return item.statements.walk(options, fn, item, 'cases');
      });
    }
  };

  Node.prototype.clone = function(hash) {
    var i;
    for (i in this) {
      if (i === 'tokenizer' || i === 'length' || i === 'filename') {
        continue;
      }
      if (hash[i] == null) {
        hash[i] = this[i];
      }
    }
    return new Node(this.tokenizer, hash);
  };

  Node.prototype.toHash = function(done) {
    var hash, i, toHash;
    if (done == null) {
      done = [];
    }
    hash = {};
    toHash = function(what) {
      if (!what) {
        return null;
      }
      if (what.toHash) {
        if (__indexOf.call(done, what) >= 0) {
          return "--recursive " + what.id + "--";
        }
        what.id = done.push(what);
        return what.toHash(done);
      } else {
        return what;
      }
    };
    hash.type = this.typeName();
    hash.src = this.src();
    for (i in this) {
      if (i === 'filename' || i === 'length' || i === 'type' || i === 'start' || i === 'end' || i === 'tokenizer') {
        continue;
      }
      if (typeof this[i] === 'function') {
        continue;
      }
      if (!this[i]) {
        continue;
      }
      if (this[i].constructor === Array) {
        hash[i] = _.map(this[i], function(item) {
          return toHash(item);
        });
      } else {
        hash[i] = toHash(this[i]);
      }
    }
    return hash;
  };

  Node.prototype.inspect = function() {
    return JSON.stringify(this.toHash(), null, '  ');
  };

  Node.prototype.src = function() {
    return this.tokenizer.source.substr(this.start, this.end - this.start);
  };

  Node.prototype.typeName = function() {
    return Types[this.type];
  };

  Node.prototype.isA = function() {
    var what, _ref;
    what = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _ref = Types[this.type], __indexOf.call(what, _ref) >= 0;
  };

  Types = (function() {
    var dict, i, last;
    dict = {};
    last = 0;
    for (i in tokens) {
      if (typeof tokens[i] === 'number') {
        dict[tokens[i]] = i.toLowerCase();
        last = tokens[i];
      }
    }
    dict[++last] = 'call_statement';
    dict[++last] = 'existence_check';
    return dict;
  })();

  Typenames = (function() {
    var dict, i;
    dict = {};
    for (i in Types) {
      dict[Types[i]] = i;
    }
    return dict;
  })();

  this.NodeExt = exports = {
    Types: Types,
    Typenames: Typenames,
    Node: Node
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = exports;
  }

}).call(this);
