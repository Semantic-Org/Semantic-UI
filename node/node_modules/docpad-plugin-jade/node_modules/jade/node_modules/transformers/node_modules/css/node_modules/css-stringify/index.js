
/**
 * Stringfy the given AST `node`.
 *
 * @param {Object} node
 * @param {Object} options
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  return new Compiler(options).compile(node);
};

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  this.compress = options.compress;
  this.indentation = options.indent;
}

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet.rules.map(this.visit, this)
    .join(this.compress ? '' : '\n\n');
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  if (node.charset) return this.charset(node);
  if (node.keyframes) return this.keyframes(node);
  if (node.media) return this.media(node);
  if (node.import) return this.import(node);
  return this.rule(node);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return '@import ' + node.import + ';';
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  if (this.compress) {
    return '@media '
      + node.media
      + '{'
      + node.rules.map(this.visit, this).join('')
      + '}';
  }

  return '@media '
    + node.media
    + ' {\n'
    + this.indent(1)
    + node.rules.map(this.visit, this).join('\n\n')
    + this.indent(-1)
    + '\n}';
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  if (this.compress) {
    return '@charset ' + node.charset + ';';
  }

  return '@charset ' + node.charset + ';\n';
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  if (this.compress) {
    return '@'
      + (node.vendor || '')
      + 'keyframes '
      + node.name
      + '{'
      + node.keyframes.map(this.keyframe, this).join('')
      + '}';
  }

  return '@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name
    + ' {\n'
    + this.indent(1)
    + node.keyframes.map(this.keyframe, this).join('\n')
    + this.indent(-1)
    + '}';
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  if (this.compress) {
    return node.values.join(',')
      + '{'
      + node.declarations.map(this.declaration, this).join(';')
      + '}';
  }

  return this.indent()
    + node.values.join(', ')
    + ' {\n'
    + this.indent(1)
    + node.declarations.map(this.declaration, this).join(';\n')
    + this.indent(-1)
    + '\n' + this.indent() + '}\n';
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();

  if (this.compress) {
    return node.selectors.join(',')
      + '{'
      + node.declarations.map(this.declaration, this).join(';')
      + '}';
  }

  return node.selectors.map(function(s){ return indent + s }).join(',\n')
    + ' {\n'
    + this.indent(1)
    + node.declarations.map(this.declaration, this).join(';\n')
    + this.indent(-1)
    + '\n' + this.indent() + '}';
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  if (this.compress) {
    return node.property + ':' + node.value;
  }

  return this.indent() + node.property + ': ' + node.value;
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};
