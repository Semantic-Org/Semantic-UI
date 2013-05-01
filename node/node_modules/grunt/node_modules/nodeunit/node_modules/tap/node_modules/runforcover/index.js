var bunker = require('bunker'),
    Module = require('module').Module,
    path = require('path'),
    fs = require('fs'),
    vm = require('vm');

function CoverageData (filename, bunker) {
  this.bunker = bunker;
  this.filename = filename;
  this.nodes = {};
};

CoverageData.prototype.visit = function(node) {
  ++(this.nodes[node.id] = this.nodes[node.id] || {node:node, count:0}).count;
};

CoverageData.prototype.missing = function() {
  var nodes = this.nodes,
      missing = this.bunker.nodes.filter(function(node) {
        return !nodes[node.id];
      });

  return missing;
};

CoverageData.prototype.stats = function() {
  var missing = this.missing(),
      filedata = fs.readFileSync(this.filename, 'utf8').split('\n');

  var seenLines = [],
      lines = 
      missing.sort(function(lhs, rhs) {
        return lhs.node[0].start.line < rhs.node[0].start.line ? -1 :
               lhs.node[0].start.line > rhs.node[0].start.line ? 1  :
               0;
      }).filter(function(node) {

        var okay = (seenLines.indexOf(node.node[0].start.line) < 0);
        if(okay)
          seenLines.push(node.node[0].start.line);
        return okay;

      }).map(function(node, idx, all) {
        return {
          lineno:node.node[0].start.line + 1,
          source:function() { return filedata[node.node[0].start.line]; }
        };
      });

  return {
    percentage:(filedata.length-seenLines.length)/filedata.length,
    lines:lines,
    missing:seenLines.length,
    seen:(filedata.length-seenLines.length)
  };
};

module.exports.createEnvironment = function(module, filename) {
    var req = function(path) {
      return Module._load(path, module);
    };
    req.resolve = function(request) {
      return Module._resolveFilename(request, module)[1];
    }
    req.paths = Module._paths;
    req.main = process.mainModule;
    req.extensions = Module._extensions;
    req.registerExtension = function() {
      throw new Error('require.registerExtension() removed. Use ' +
                      'require.extensions instead.');
    }
    require.cache = Module._cache;

    var ctxt = {};
    for(var k in global)
      ctxt[k] = global[k];

    ctxt.require = req;
    ctxt.exports = module.exports;
    ctxt.__filename = filename;
    ctxt.__dirname = path.dirname(filename);
    ctxt.process = process;
    ctxt.console = console;
    ctxt.module = module;
    ctxt.global = ctxt;

    return ctxt;
};

module.exports.cover = function(fileRegex) {
  var originalRequire = require.extensions['.js'],
      coverageData = {},
      match = fileRegex instanceof RegExp ?
        fileRegex : new RegExp(
            fileRegex ? fileRegex.replace(/\//g, '\\/').replace(/\./g, '\\.') : '.*'
        , 'g'),
      target = this;

  require.extensions['.js'] = function(module, filename) {
    if(!match.test(filename)) return originalRequire(module, filename);

    var context = target.createEnvironment(module, filename),
        data = fs.readFileSync(filename, 'utf8'),
        bunkerized = bunker(data),
        coverage = coverageData[filename] = new CoverageData(filename, bunkerized);

    bunkerized.on('node', coverage.visit.bind(coverage));
    bunkerized.assign(context);

    var wrapper = '(function(ctxt) { with(ctxt) { return '+Module.wrap(bunkerized.compile())+'; } })',
        compiledWrapper = vm.runInThisContext(wrapper, filename, true)(context);

    var args = [context.exports, context.require, module, filename, context.__dirname];
    return compiledWrapper.apply(module.exports, args);
  };

  var retval = function(ready) {
    ready(coverageData);
  };

  retval.release = function() {
    require.extensions['.js'] = originalRequire;
  };

  return retval;
};

