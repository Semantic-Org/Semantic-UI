var fs = require("fs")
  , child_process = require("child_process")
  , path = require("path")
  , chain = require("slide").chain
  , asyncMap = require("slide").asyncMap
  , TapProducer = require("./tap-producer.js")
  , TapConsumer = require("./tap-consumer.js")
  , assert = require("./tap-assert.js")
  , inherits = require("inherits")
  , util = require("util")
  , CovHtml = require("./tap-cov-html.js")
  , glob = require("glob")

  // XXX Clean up the coverage options
  , doCoverage = process.env.TAP_COV
               || process.env.npm_package_config_coverage
               || process.env.npm_config_coverage

module.exports = Runner

inherits(Runner, TapProducer)

function Runner (options, cb) {
  this.options = options

  var diag = this.options.diag
  var dir = this.options.argv.remain
  Runner.super.call(this, diag)

  this.doCoverage = doCoverage
  // An array of full paths to files to obtain coverage
  this.coverageFiles = []
  // The source of these files
  this.coverageFilesSource = {}
  // Where to write coverage information
  this.coverageOutDir = this.options["coverage-dir"]
  // Temporary test files bunkerified we'll remove later
  this.f2delete = []
  // Raw coverage stats, as read from JSON files
  this.rawCovStats = []
  // Processed coverage information, per file to cover:
  this.covStats = {}

  if (dir) {
    var filesToCover = this.options.cover

    if (doCoverage) {
      var mkdirp = require("mkdirp")
      this.coverageOutDir = path.resolve(this.coverageOutDir)
      this.getFilesToCover(filesToCover)
      var self = this
      return mkdirp(this.coverageOutDir, 0755, function (er) {
        if (er) return self.emit("error", er)
        self.run(dir, cb)
      })
    }

    this.run(dir, cb)
  }
}


Runner.prototype.run = function() {
  var self = this
    , args = Array.prototype.slice.call(arguments)
    , cb = args.pop() || finish

  function finish (er) {
    if (er) {
      self.emit("error", er)
    }

    if (!doCoverage) return self.end()

    // Cleanup temporary test files with coverage:
    self.f2delete.forEach(function(f) {
      fs.unlinkSync(f)
    })
    self.getFilesToCoverSource(function(err, data) {
      if (err) {
        self.emit("error", err)
      }
      self.getPerFileCovInfo(function(err, data) {
        if (err) {
          self.emit("error", err)
        }
        self.mergeCovStats(function(err, data) {
          if (err) {
            self.emit("error", err)
          }
          CovHtml(self.covStats, self.coverageOutDir, function() {
            self.end()
          })
        })
      })
    })
  }

  if (Array.isArray(args[0])) {
    args = args[0]
  }
  self.runFiles(args, "", cb)
}

Runner.prototype.runDir = function (dir, cb) {
  var self = this
  fs.readdir(dir, function (er, files) {
    if (er) {
      self.write(assert.fail("failed to readdir " + dir, { error: er }))
      self.end()
      return
    }
    files = files.sort(function(a, b) {
      return a > b ? 1 : -1
    })
    files = files.filter(function(f) {
      return !f.match(/^\./)
    })
    files = files.map(function(file) {
      return path.resolve(dir, file)
    })

    self.runFiles(files, path.resolve(dir), cb)
  })
}


// glob the filenames so that test/*.js works on windows
Runner.prototype.runFiles = function (files, dir, cb) {
  var self = this
  var globRes = []
  chain(files.map(function (f) {
    return function (cb) {
      glob(f, function (er, files) {
        if (er)
          return cb(er)
        globRes.push.apply(globRes, files)
        cb()
      })
    }
  }), function (er) {
    if (er)
      return cb(er)
    runFiles(self, globRes, dir, cb)
  })
}

function runFiles(self, files, dir, cb) {
  chain(files.map(function(f) {
    return function (cb) {
      if (self._bailedOut) return
      var relDir = dir || path.dirname(f)
        , fileName = relDir === "." ? f : f.substr(relDir.length + 1)

      self.write(fileName)
      fs.lstat(f, function(er, st) {
        if (er) {
          self.write(assert.fail("failed to stat " + f, {error: er}))
          return cb()
        }

        var cmd = f, args = [], env = {}

        if (path.extname(f) === ".js") {
          cmd = "node"
          if (self.options.gc) {
            args.push("--expose-gc")
          }
          args.push(fileName)
        } else if (path.extname(f) === ".coffee") {
          cmd = "coffee"
          args.push(fileName)
        } else {
          // Check if file is executable
          if ((st.mode & 0100) && process.getuid) {
            if (process.getuid() != st.uid) {
              return cb()
            }
          } else if ((st.mode & 0010) && process.getgid) {
            if (process.getgid() != st.gid) {
              return cb()
            }
          } else if ((st.mode & 0001) == 0) {
            return cb()
          }
        }

        if (st.isDirectory()) {
          return self.runDir(f, cb)
        }

        if (doCoverage && path.extname(f) === ".js") {
          var foriginal = fs.readFileSync(f, "utf8")
            , fcontents = self.coverHeader() + foriginal + self.coverFooter()
            , tmpBaseName = path.basename(f, path.extname(f))
                          + ".with-coverage." + process.pid + path.extname(f)
            , tmpFname = path.resolve(path.dirname(f), tmpBaseName)

          fs.writeFileSync(tmpFname, fcontents, "utf8")
          args.splice(-1, 1, tmpFname)
        }

        for (var i in process.env) {
          env[i] = process.env[i]
        }
        env.TAP = 1

        var cp = child_process.spawn(cmd, args, { env: env, cwd: relDir })
          , out = ""
          , err = ""
          , tc = new TapConsumer()
          , childTests = [f]

        var timeout = setTimeout(function () {
          if (!cp._ended) {
            cp._timedOut = true
            cp.kill()
          }
        }, self.options.timeout * 1000)

        tc.on("data", function(c) {
          self.emit("result", c)
          self.write(c)
        })

        tc.on("bailout", function (message) {
          clearTimeout(timeout)
          console.log("# " + f.substr(process.cwd().length + 1))
          process.stderr.write(err)
          process.stdout.write(out + "\n")
          self._bailedOut = true
          cp._ended = true
          cp.kill()
        })

        cp.stdout.pipe(tc)
        cp.stdout.on("data", function (c) { out += c })
        cp.stderr.on("data", function (c) {
          if (self.options.stderr) process.stderr.write(c)
          err += c
        })

        cp.on("close", function (code, signal) {
          if (cp._ended) return
          cp._ended = true
          var ok = !cp._timedOut && code === 0
          clearTimeout(timeout)
          //childTests.forEach(function (c) { self.write(c) })
          var res = { name: path.dirname(f).replace(process.cwd() + "/", "")
                          + "/" + fileName
                    , ok: ok
                    , exit: code }

          if (cp._timedOut)
            res.timedOut = cp._timedOut
          if (signal)
            res.signal = signal

          if (err) {
            res.stderr = err
            if (tc.results.ok &&
                tc.results.tests === 0 &&
                !self.options.stderr) {
              // perhaps a compilation error or something else failed.
              // no need if stderr is set, since it will have been
              // output already anyway.
              console.error(err)
            }
          }

          // tc.results.ok = tc.results.ok && ok
          tc.results.add(res)
          res.command = [cmd].concat(args).map(JSON.stringify).join(" ")
          self.emit("result", res)
          self.emit("file", f, res, tc.results)
          self.write(res)
          self.write("\n")
          if (doCoverage) {
            self.f2delete.push(tmpFname)
          }
          cb()
        })
      })
    }
  }), cb)

  return self
}


// Get an array of full paths to files we are interested into obtain
// code coverage.
Runner.prototype.getFilesToCover = function(filesToCover) {
  var self = this
  filesToCover = filesToCover.split(",").map(function(f) {
    return path.resolve(f)
  }).filter(function(f) {
    return path.existsSync(f)
  })

  function recursive(f) {
    if (path.extname(f) === "") {
      // Is a directory:
      fs.readdirSync(f).forEach(function(p) {
        recursive(f + "/" + p)
      })
    } else {
      self.coverageFiles.push(f)
    }
  }
  filesToCover.forEach(function(f) {
    recursive(f)
  })
}

// Prepend to every test file to run. Note tap.test at the very top due it
// "plays" with include paths.
Runner.prototype.coverHeader = function() {
  // semi here since we're injecting it before the first line,
  // and don't want to mess up line numbers in the test files.
  return "var ___TAP_COVERAGE = require("
       + JSON.stringify(require.resolve("runforcover"))
       + ").cover(/.*/g);"
}

// Append at the end of every test file to run. Actually, the stuff which gets
// the coverage information.
// Maybe it would be better to move into a separate file template so editing
// could be easier.
Runner.prototype.coverFooter = function() {
  var self = this
  // This needs to be a string with proper interpolations:
  return [ ""
  , "var ___TAP = require(" + JSON.stringify(require.resolve("./main.js")) + ")"
  , "if (typeof ___TAP._plan === 'number') ___TAP._plan ++"
  , "___TAP.test(" + JSON.stringify("___coverage") + ", function(t) {"
  , "  var covFiles = " + JSON.stringify(self.coverageFiles)
  , "    , covDir = " + JSON.stringify(self.coverageOutDir)
  , "    , path = require('path')"
  , "    , fs = require('fs')"
  , "    , testFnBase = path.basename(__filename, '.js') + '.json'"
  , "    , testFn = path.resolve(covDir, testFnBase)"
  , ""
  , "  function asyncForEach(arr, fn, callback) {"
  , "    if (!arr.length) {"
  , "      return callback()"
  , "    }"
  , "    var completed = 0"
  , "    arr.forEach(function(i) {"
  , "      fn(i, function (err) {"
  , "        if (err) {"
  , "          callback(err)"
  , "          callback = function () {}"
  , "        } else {"
  , "          completed += 1"
  , "          if (completed === arr.length) {"
  , "            callback()"
  , "          }"
  , "        }"
  , "      })"
  , "    })"
  , "  }"
  , ""
  , "  ___TAP_COVERAGE(function(coverageData) {"
  , "    var outObj = {}"
  , "    asyncForEach(covFiles, function(f, cb) {"
  , "      if (coverageData[f]) {"
  , "        var stats = coverageData[f].stats()"
  , "          , stObj = stats"
  , "        stObj.lines = stats.lines.map(function (l) {"
  , "          return { number: l.lineno, source: l.source() }"
  , "        })"
  , "        outObj[f] = stObj"
  , "      }"
  , "      cb()"
  , "    }, function(err) {"
  , "      ___TAP_COVERAGE.release()"
  , "      fs.writeFileSync(testFn, JSON.stringify(outObj))"
  , "      t.end()"
  , "    })"
  , "  })"
  , "})" ].join("\n")
}


Runner.prototype.getFilesToCoverSource = function(cb) {
  var self = this
  asyncMap(self.coverageFiles, function(f, cb) {
    fs.readFile(f, "utf8", function(err, data) {
      var lc = 0
      if (err) {
        cb(err)
      }
      self.coverageFilesSource[f] = data.split("\n").map(function(l) {
        lc += 1
        return { number: lc, source: l }
      })
      cb()
    })
  }, cb)
}

Runner.prototype.getPerFileCovInfo = function(cb) {
  var self = this
    , covPath = path.resolve(self.coverageOutDir)

  fs.readdir(covPath, function(err, files) {
    if (err) {
      self.emit("error", err)
    }
    var covFiles = files.filter(function(f) {
      return path.extname(f) === ".json"
    })
    asyncMap(covFiles, function(f, cb) {
      fs.readFile(path.resolve(covPath, f), "utf8", function(err, data) {
        if (err) {
          cb(err)
        }
        self.rawCovStats.push(JSON.parse(data))
        cb()
      })
    }, function(f, cb) {
      fs.unlink(path.resolve(covPath, f), cb)
    }, cb)
  })
}

Runner.prototype.mergeCovStats = function(cb) {
  var self = this
  self.rawCovStats.forEach(function(st) {
    Object.keys(st).forEach(function(i) {
      // If this is the first time we reach this file, just add the info:
      if (!self.covStats[i]) {
        self.covStats[i] = {
          missing: st[i].lines
        }
      } else {
        // If we already added info for this file before, we need to remove
        // from self.covStats any line not duplicated again (since it has
        // run on such case)
        self.covStats[i].missing = self.covStats[i].missing.filter(
          function(l) {
            return (st[i].lines.indexOf(l))
          })
      }
    })
  })

  // This is due to a bug into
  // chrisdickinson/node-bunker/blob/feature/add-coverage-interface
  // which is using array indexes for line numbers instead of the right number
  Object.keys(self.covStats).forEach(function(f) {
    self.covStats[f].missing = self.covStats[f].missing.map(function(line) {
      return { number: line.number, source: line.source }
    })
  })

  Object.keys(self.coverageFilesSource).forEach(function(f) {
    if (!self.covStats[f]) {
      self.covStats[f] = { missing: self.coverageFilesSource[f]
                          , percentage: 0
      }
    }
    self.covStats[f].lines = self.coverageFilesSource[f]
    self.covStats[f].loc = self.coverageFilesSource[f].length

    if (!self.covStats[f].percentage) {
      self.covStats[f].percentage =
        1 - (self.covStats[f].missing.length / self.covStats[f].loc)
    }

  })
  cb()
}
