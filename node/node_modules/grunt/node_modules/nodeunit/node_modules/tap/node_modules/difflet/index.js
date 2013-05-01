var traverse = require('traverse');
var Stream = require('stream').Stream;
var charm = require('charm');
var deepEqual = require('deep-is');

var exports = module.exports = function (opts_) {
    var fn = difflet.bind(null, opts_);
    fn.compare = function (prev, next) {
        var opts = Object.keys(opts_ || {}).reduce(function (acc, key) {
            acc[key] = opts_[key];
            return acc;
        }, {});
        var s = opts.stream = new Stream;
        var data = '';
        s.write = function (buf) { data += buf };
        s.end = function () {};
        s.readable = true;
        s.writable = true;
        
        difflet(opts, prev, next);
        return data;
    };
    return fn;
};

exports.compare = function (prev, next) {
    return exports({}).compare(prev, next);
};

function difflet (opts, prev, next) {
    var stream = opts.stream || new Stream;
    if (!opts.stream) {
        stream.readable = true;
        stream.writable = true;
        stream.write = function (buf) { this.emit('data', buf) };
        stream.end = function () { this.emit('end') };
    }
    
    if (!opts) opts = {};
    if (opts.start === undefined && opts.stop === undefined) {
        var c = charm(stream);
        opts.start = function (type) {
            c.foreground({
                inserted : 'green',
                updated : 'blue',
                deleted : 'red',
                comment : 'cyan',
            }[type]);
            c.display('bright');
        };
        opts.stop = function (type) {
            c.display('reset');
        };
    }
    var write = function (buf) {
        if (opts.write) opts.write(buf, stream)
        else stream.write(buf)
    };
    
    var commaFirst = opts.comma === 'first';
    
    var stringify = function (node, params) {
        return stringifier.call(this, true, node, params || opts);
    };
    var plainStringify = function (node, params) {
        return stringifier.call(this, false, node, params || opts);
    };
    
    var levels = 0;
    function set (type) {
        if (levels === 0) opts.start(type, stream);
        levels ++;
    }
    
    function unset (type) {
        if (--levels === 0) opts.stop(type, stream);
    }
    
    function stringifier (insertable, node, opts) {
        var indent = opts.indent;
        
        if (insertable) {
            var prevNode = traverse.get(prev, this.path || []);
        }
        var inserted = insertable && prevNode === undefined;
        
        var indentx;
        try {
            indentx = indent ? Array(
                ((this.path || []).length + 1) * indent + 1
            ).join(' ') : '';
        } catch (e) {
            // at times we get an invalid Array size here and need to prevent crashing
            indentx = '';
        }
        if (commaFirst) indentx = indentx.slice(indent);
        
        if (Array.isArray(node)) {
            var updated = (prevNode || traverse.has(prev, this.path))
                && !Array.isArray(prevNode);
            if (updated) {
                set('updated');
            }
            
            if (opts.comment && !Array.isArray(prevNode)) {
                indent = 0;
            }
            
            this.before(function () {
                if (inserted) set('inserted');
                if (indent && commaFirst) {
                    if ((this.path || []).length === 0
                    || Array.isArray(this.parent.node)) {
                        write('[ ');
                    }
                    else write('\n' + indentx + '[ ');
                }
                else if (indent) {
                    write('[\n' + indentx);
                }
                else {
                    write('[');
                }
            });
            
            this.post(function (child) {
                if (!child.isLast && !(indent && commaFirst)) {
                    write(',');
                }
                
                var prev = prevNode && prevNode[child.key];
                if (indent && opts.comment && child.node !== prev
                && (typeof child.node !== 'object' || typeof prev !== 'object')
                ) {
                    set('comment');
                    write(' // != ');
                    traverse(prev).forEach(function (x) {
                        plainStringify.call(this, x, { indent : 0 });
                    });
                    unset('comment');
                }
                
                if (!child.isLast) {
                    if (indent && commaFirst) {
                        write('\n' + indentx + ', ');
                    }
                    else if (indent) {
                        write('\n' + indentx);
                    }
                }
            });
            
            this.after(function () {
                if (indent && commaFirst) write('\n' + indentx);
                else if (indent) write('\n' + indentx.slice(indent));
                
                write(']');
                if (updated) unset('updated');
                if (inserted) unset('inserted');
            });
        }
        else if (isRegExp(node)) {
            this.block();
            
            if (inserted) {
                set('inserted');
                write(node.toString());
                unset('inserted');
            }
            else if (insertable && prevNode !== node) {
                set('updated');
                write(node.toString());
                unset('updated');
            }
            else write(node.toString());
        }
        else if (typeof node === 'object'
        && node && typeof node.inspect === 'function') {
            this.block();
            if (inserted) {
                set('inserted');
                write(node.inspect());
                unset('inserted');
            }
            else if (!(prevNode && typeof prevNode.inspect === 'function'
            && prevNode.inspect() === node.inspect())) {
                set('updated');
                write(node.inspect());
                unset('updated');
            }
            else write(node.inspect());
        }
        else if (typeof node == 'object' && node !== null) {
            var insertedKey = false;
            var deleted = insertable && typeof prevNode === 'object' && prevNode
                ? Object.keys(prevNode).filter(function (key) {
                    return !Object.hasOwnProperty.call(node, key);
                })
                : []
            ;
            
            this.before(function () {
                if (inserted) set('inserted');
                write(indent && commaFirst && !this.isRoot
                    ? '\n' + indentx + '{ '
                    : '{'
                );
            });
            
            this.pre(function (x, key) {
                if (insertable) {
                    var obj = traverse.get(prev, this.path.concat(key));
                    if (obj === undefined) {
                        insertedKey = true;
                        set('inserted');
                    }
                }
                
                if (indent && !commaFirst) write('\n' + indentx);
                
                plainStringify(key);
                write(indent ? ' : ' : ':');
            });
            
            this.post(function (child) {
                if (!child.isLast && !(indent && commaFirst)) {
                    write(',');
                }
                
                if (child.isLast && deleted.length) {
                    if (insertedKey) unset('inserted');
                    insertedKey = false;
                }
                else if (insertedKey) {
                    unset('inserted');
                    insertedKey = false;
                }
                
                var prev = prevNode && prevNode[child.key];
                if (indent && opts.comment && child.node !== prev
                && (typeof child.node !== 'object' || typeof prev !== 'object')
                ) {
                    set('comment');
                    write(' // != ');
                    traverse(prev).forEach(function (x) {
                        plainStringify.call(this, x, { indent : 0 });
                    });
                    unset('comment');
                }
                
                if (child.isLast && deleted.length) {
                    if (insertedKey) unset('inserted');
                    insertedKey = false;
                    
                    if (indent && commaFirst) {
                        write('\n' + indentx + ', ')
                    }
                    else if (opts.comment && indent) {
                        write('\n' + indentx);
                    }
                    else if (indent) {
                        write(',\n' + indentx);
                    }
                    else write(',');
                }
                else {
                    if (!child.isLast) {
                        if (indent && commaFirst) {
                            write('\n' + indentx + ', ');
                        }
                    }
                }
            });
            
            this.after(function () {
                if (inserted) unset('inserted');
                
                if (deleted.length) {
                    if (indent && !commaFirst
                    && Object.keys(node).length === 0) {
                        write('\n' + indentx);
                    }
                    
                    set('deleted');
                    deleted.forEach(function (key, ix) {
                        if (indent && opts.comment) {
                            unset('deleted');
                            set('comment');
                            write('// ');
                            unset('comment');
                            set('deleted');
                        }
                        
                        plainStringify(key);
                        write(indent ? ' : ' : ':');
                        traverse(prevNode[key]).forEach(function (x) {
                            plainStringify.call(this, x, { indent : 0 });
                        });
                        
                        var last = ix === deleted.length - 1;
                        if (insertable && !last) {
                            if (indent && commaFirst) {
                                write('\n' + indentx + ', ');
                            }
                            else if (indent) {
                                write(',\n' + indentx);
                            }
                            else write(',');
                        }
                    });
                    unset('deleted');
                }
                
                if (commaFirst && indent) {
                    write(indentx.slice(indent) + ' }');
                }
                else if (indent) {
                    write('\n' + indentx.slice(indent) + '}');
                }
                else write('}');
            });
        }
        else {
            var changed = false;
            
            if (inserted) set('inserted');
            else if (insertable && !deepEqual(prevNode, node)) {
                changed = true;
                set('updated');
            }
            
            if (typeof node === 'string') {
                write('"' + node.toString().replace(/"/g, '\\"') + '"');
            }
            else if (isRegExp(node)) {
                write(node.toString());
            }
            else if (typeof node === 'function') {
                write(node.name
                    ? '[Function: ' + node.name + ']'
                    : '[Function]'
                );
            }
            else if (node === undefined) {
                write('undefined');
            }
            else if (node === null) {
                write('null');
            }
            else {
                write(node.toString());
            }
            
            if (inserted) unset('inserted');
            else if (changed) unset('updated');
        }
    }
    
    if (opts.stream) {
        traverse(next).forEach(stringify);
    }
    else process.nextTick(function () {
        traverse(next).forEach(stringify);
        stream.emit('end');
    });
    
    return stream;
}

function isRegExp (node) {
    return node instanceof RegExp || (node
        && typeof node.test === 'function' 
        && typeof node.exec === 'function'
        && typeof node.compile === 'function'
        && node.constructor && node.constructor.name === 'RegExp'
    );
}
