(function() {
  var compile, compileToFile, each, eachFile, eco, exec, fs, indent, mkdir, parseOptions, path, preprocessArgs, printUsage, printVersion, read, stripExtension, sys;
  var __slice = Array.prototype.slice;

  fs = require("fs");

  path = require("path");

  sys = require("util");

  eco = require("..");

  exec = require("child_process").exec;

  indent = require("./util").indent;

  printUsage = function() {
    console.error("\nUsage: eco [options] path/to/template.eco\n\n  -i, --identifier [NAME]  set the name of the global template object\n  -o, --output [DIR]       set the directory for compiled JavaScript\n  -p, --print              print the compiled JavaScript to stdout\n  -s, --stdio              listen for and compile templates over stdio\n  -v, --version            display Eco version\n  -h, --help               display this help message\n");
    return process.exit(1);
  };

  printVersion = function() {
    var package;
    package = JSON.parse(fs.readFileSync(__dirname + "/../package.json", "utf8"));
    console.error("Eco version " + package.version);
    return process.exit(0);
  };

  preprocessArgs = function(args) {
    var arg, char, match, result, _i, _j, _len, _len2, _ref;
    result = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (match = /^-([a-z]{2,})/.exec(arg)) {
        _ref = match[1].split('');
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          char = _ref[_j];
          result.push("-" + char);
        }
      } else {
        result.push(arg);
      }
    }
    return result;
  };

  parseOptions = function(args) {
    var arg, option, options, _i, _len, _ref;
    options = {
      files: [],
      identifier: "ecoTemplates"
    };
    option = null;
    _ref = preprocessArgs(args);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      arg = _ref[_i];
      if (option) {
        options[option] = arg;
        option = null;
      } else {
        switch (arg) {
          case "-i":
          case "--identifier":
            option = "identifier";
            break;
          case "-o":
          case "--output":
            option = "output";
            break;
          case "-p":
          case "--print":
            options.print = true;
            break;
          case "-s":
          case "--stdio":
            options.stdio = true;
            break;
          case "-v":
          case "--version":
            printVersion();
            break;
          default:
            if (/^-/.test(arg)) {
              printUsage();
            } else {
              options.files.push(arg);
            }
        }
      }
    }
    if (option) printUsage();
    return options;
  };

  read = function(stream, callback) {
    var buffer;
    buffer = "";
    stream.setEncoding("utf8");
    stream.on("data", function(data) {
      return buffer += data;
    });
    return stream.on("end", function() {
      return typeof callback === "function" ? callback(buffer) : void 0;
    });
  };

  each = function(_arg, callback) {
    var proceed, values;
    values = 1 <= _arg.length ? __slice.call(_arg, 0) : [];
    return (proceed = function() {
      return callback(values.shift(), proceed);
    })();
  };

  eachFile = function(files, callback) {
    var traverse;
    traverse = function(root, dir, done) {
      return fs.readdir(dir, function(err, entries) {
        if (err) return callback(err);
        return each(entries, function(entry, proceed) {
          var file;
          if (entry == null) return done();
          file = path.join(dir, entry);
          return fs.stat(file, function(err, stat) {
            if (err) return callback(err);
            if (stat.isFile() && /\.eco$/.test(file)) {
              return callback(null, file, root, proceed);
            } else if (stat.isDirectory()) {
              return traverse(root, file, proceed);
            } else {
              return proceed();
            }
          });
        });
      });
    };
    return each(files, function(file, proceed) {
      if (file == null) return;
      return fs.stat(file, function(err, stat) {
        var root;
        if (err) return callback(err);
        if (stat.isDirectory()) {
          return traverse(file, file, proceed);
        } else {
          root = path.dirname(file);
          return callback(null, file, root, proceed);
        }
      });
    });
  };

  stripExtension = function(name) {
    return name.replace(/(\.eco)?$/, "");
  };

  compile = function(infile, identifier, name, callback) {
    return fs.readFile(infile, "utf8", function(err, source) {
      var template;
      if (err) return callback(err);
      template = indent(eco.precompile(source), 2);
      return callback(null, "(function() {\n  this." + identifier + " || (this." + identifier + " = {});\n  this." + identifier + "[" + (JSON.stringify(name)) + "] = " + (template.slice(2)) + ";\n}).call(this);");
    });
  };

  mkdir = function(dir, callback) {
    return exec("mkdir -p " + (JSON.stringify(dir)), function(err, stdout, stderr) {
      return callback(err);
    });
  };

  compileToFile = function(infile, identifier, root, outdir, callback) {
    var name, outfile;
    root = path.join(root, "/");
    if (root === infile.slice(0, root.length)) {
      name = stripExtension(infile.slice(root.length));
    } else {
      name = stripExtension(infile);
    }
    outfile = path.join(outdir != null ? outdir : root, name + ".js");
    return mkdir(path.dirname(outfile), function(err) {
      if (err) return callback(err);
      return compile(infile, identifier, name, function(err, result) {
        return fs.writeFile(outfile, result + "\n", "utf8", function(err) {
          if (err) return callback(err);
          return callback(null, outfile, name);
        });
      });
    });
  };

  exports.run = function(args) {
    var infile, name, options;
    if (args == null) args = process.argv.slice(2);
    options = parseOptions(args);
    if (options.stdio) {
      if (options.files.length || options.output) printUsage();
      process.openStdin();
      return read(process.stdin, function(source) {
        return sys.puts(eco.precompile(source));
      });
    } else if (options.print) {
      if (options.files.length !== 1 || options.output) printUsage();
      infile = options.files[0];
      name = stripExtension(path.basename(infile));
      return compile(infile, options.identifier, name, function(err, result) {
        if (err) throw err;
        return sys.puts(result);
      });
    } else {
      if (!options.files.length) printUsage();
      return eachFile(options.files, function(err, infile, root, proceed) {
        if (err) throw err;
        if (infile == null) return;
        return compileToFile(infile, options.identifier, root, options.output, function(err, outfile, name) {
          if (err) throw err;
          console.error("" + (JSON.stringify(name)) + ": " + infile + " -> " + outfile);
          return proceed();
        });
      });
    }
  };

}).call(this);
