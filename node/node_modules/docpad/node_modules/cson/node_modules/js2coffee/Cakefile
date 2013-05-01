{spawn, exec} = require 'child_process'

# Tasks
task 'test', 'Run tests', ->
  require __dirname + '/test/test'

task 'build', 'Builds the browser version', ->
  {readFileSync, writeFileSync} = require('fs')
  {compile} = require('coffee-script')

  run 'mkdir -p dist'

  output = [
    readFileSync('lib/narcissus_packed.js', 'utf-8')
    compile(readFileSync('lib/node_ext.coffee', 'utf-8'))
    compile(readFileSync('lib/helpers.coffee', 'utf-8'))
    compile(readFileSync('lib/js2coffee.coffee', 'utf-8'))
  ]

  combined   = output.join("\n")
  compressed = pack(combined)

  writeFileSync 'dist/js2coffee.js', combined
  writeFileSync 'dist/js2coffee.min.js', compressed

  console.log '* dist/js2coffee.js'
  console.log '* dist/js2coffee.min.js'

# Helpers
run = (cmd, callback, options={}) ->
  console.warn "$ #{cmd}"  unless options.quiet?

  exec cmd, (err, stdout, stderr) ->
    callback()  if typeof callback == 'function'
    console.warn stderr  if stderr
    console.log stdout   if stdout

# Compress JS with simple regexes. (Because common packers
# seem to munge Narcissus badly)
pack = (str) ->
  spaces        = new RegExp(' *(\n *)+', 'g')
  comments      = /\/\*(\n|.)*?\*\//g
  line_comments = /\/\/.*\n/g

  compressed = str
  compressed = compressed.replace(comments, " ")
  compressed = compressed.replace(line_comments, "\n")
  compressed = compressed.replace(spaces, "\n")

  compressed

task 'doc', 'Builds docs', ->
  run "docco lib/js2coffee.coffee"
