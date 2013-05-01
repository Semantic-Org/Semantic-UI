var burrito = require('burrito');
var vm = require('vm');
var EventEmitter = require('events').EventEmitter;

module.exports = function (src) {
    var b = new Bunker();
    if (src) b.include(src);
    return b;
};

function Bunker () {
    this.sources = [];
    this.nodes = [];
    
    this.names = {
        call : burrito.generateName(6),
        expr : burrito.generateName(6),
        stat : burrito.generateName(6),
        return : burrito.generateName(6)
    };
}

Bunker.prototype = new EventEmitter;

Bunker.prototype.include = function (src) {
    this.sources.push(src);
    this.source = null;
    return this;
};

Bunker.prototype.compile = function () {
    var src = this.sources.join('\n');
    var nodes = this.nodes;
    var names = this.names;
    
    return burrito(src, function (node) {
        var i = nodes.length;
        
        if (node.name === 'call') {
            nodes.push(node);
            node.wrap(names.call + '(' + i + ')(%s)');
        }
        else if (node.name === 'stat' || node.name === 'throw'
        || node.name === 'var') {
            nodes.push(node);
            node.wrap('{' + names.stat + '(' + i + ');%s}');
        }
        else if (node.name === 'return') {
            nodes.push(node);
            // We need to wrap the new source in a function definition
            // so that UglifyJS will allow the presence of return
            var stat = names.stat + '(' + i + ');';
            var wrapped = 'function ' + names.return + '() {'
                + stat + node.source()
                +'}'
            ;
            var parsed = burrito.parse(wrapped);
            // Remove the function definition from the AST
            parsed[1] = parsed[1][0][3];
            node.state.update(parsed, true);
        }
        else if (node.name === 'binary') {
            nodes.push(node);
            node.wrap(names.expr + '(' + i + ')(%s)');
        }
        else if (node.name === 'unary-postfix' || node.name === 'unary-prefix') {
            nodes.push(node);
            node.wrap(names.expr + '(' + i + ')(%s)');
        }
        
        if (i !== nodes.length) {
            node.id = i;
        }
    });
};

Bunker.prototype.assign = function (context) {
    if (!context) context = {};
    
    var self = this;
    var stack = [];
    
    context[self.names.call] = function (i) {
        var node = self.nodes[i];
        stack.unshift(node);
        self.emit('node', node, stack);
        
        return function (expr) {
            stack.shift();
            return expr;
        };
    };
    
    context[self.names.expr] = function (i) {
        var node = self.nodes[i];
        self.emit('node', node, stack);
        
        return function (expr) {
            return expr;
        };
    };
    
    context[self.names.stat] = function (i) {
        var node = self.nodes[i];
        self.emit('node', node, stack);
    };
    
    return context;
};
    
Bunker.prototype.run = function (context) {
    var src = this.compile();
    vm.runInNewContext(src, this.assign(context));
    
    return this;
};
