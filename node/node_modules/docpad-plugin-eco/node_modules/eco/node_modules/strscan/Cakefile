# Much of this Cakefile shamelessly ripped from coffee-script

fs            = require 'fs'
CoffeeScript  = require 'coffee-script'
{spawn, exec} = require 'child_process'

# ANSI Terminal Colors.
red   = '\033[0;31m'
green = '\033[0;32m'
reset = '\033[0m'

# Log a message with a color.
log = (message, color, explanation) ->
  puts color + message + reset + ' ' + (explanation or '')

extend = (object, properties) ->
  (object[key] = val) for all key, val of properties

run = (args) ->
  proc =         spawn 'coffee', args
  proc.stderr.on 'data', (buffer) -> puts buffer.toString()
  proc.on        'exit', (status) -> process.exit(1) if status != 0

task 'build', ->
  src = fs.readFileSync 'src/strscan.coffee'
  js  = CoffeeScript.compile src.toString()
  fs.writeFileSync 'lib/strscan.js', js

task 'test', ->
  extend global, require 'assert'
  passedTests = failedTests = 0
  startTime   = new Date
  originalOk  = ok
  helpers.extend global,
    ok: (args...) -> passedTests += 1; originalOk(args...)
  process.on 'exit', ->
    time = ((new Date - startTime) / 1000).toFixed(2)
    message = "passed #{passedTests} tests in #{time} seconds#{reset}"
    if failedTests
      log "failed #{failedTests} and #{message}", red
    else
      log message, green
  fs.readdir 'test', (err, files) ->
    files.forEach (file) ->
      return unless file.match(/\.coffee$/i)
      fileName = path.join 'test', file
      fs.readFile fileName, (err, code) ->
        try
          CoffeeScript.run code.toString(), {fileName}
        catch err
          failedTests += 1
          log "failed #{fileName}", red, '\n' + err.stack.toString()
