var parse = require('esprima').parse;

module.exports = function (src) {
    var ast = typeof src === 'string' ? parse(src) : src;
    return function (cb) {
        walk(ast, undefined, cb);
    };
};

function walk (node, parent, cb) {
    var keys = objectKeys(node);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'parent') continue;
        
        var child = node[key];
        if (isArray(child)) {
            for (var j = 0; j < child.length; j++) {
                var c = child[j];
                if (c && typeof c.type === 'string') {
                    c.parent = node;
                    walk(c, node, cb);
                }
            }
        }
        else if (child && typeof child.type === 'string') {
            child.parent = node;
            walk(child, node, cb);
        }
    }
    cb(node);
}

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var objectKeys = Object.keys || function (obj) {
    var keys = [];
    for (var key in obj) keys.push(key);
    return keys;
};
