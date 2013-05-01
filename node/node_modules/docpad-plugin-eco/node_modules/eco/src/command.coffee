fs   = require "fs"
path = require "path"
sys  = require "util"
eco  = require ".."

{exec} = require "child_process"
{indent} = require "./util"

printUsage = ->
  console.error """

    Usage: eco [options] path/to/template.eco

      -i, --identifier [NAME]  set the name of the global template object
      -o, --output [DIR]       set the directory for compiled JavaScript
      -p, --print              print the compiled JavaScript to stdout
      -s, --stdio              listen for and compile templates over stdio
      -v, --version            display Eco version
      -h, --help               display this help message

  """
  process.exit 1

printVersion = ->
  package = JSON.parse fs.readFileSync __dirname + "/../package.json", "utf8"
  console.error "Eco version #{package.version}"
  process.exit 0

preprocessArgs = (args) ->
  result = []
  for arg in args
    if match = /^-([a-z]{2,})/.exec arg
      for char in match[1].split ''
        result.push "-#{char}"
    else
      result.push arg
  result

parseOptions = (args) ->
  options = files: [], identifier: "ecoTemplates"
  option = null

  for arg in preprocessArgs args
    if option
      options[option] = arg
      option = null
    else
      switch arg
        when "-i", "--identifier" then option = "identifier"
        when "-o", "--output"     then option = "output"
        when "-p", "--print"      then options.print = true
        when "-s", "--stdio"      then options.stdio = true
        when "-v", "--version"    then printVersion()
        else (if /^-/.test arg    then printUsage() else options.files.push arg)

  printUsage() if option
  options

read = (stream, callback) ->
  buffer = ""
  stream.setEncoding "utf8"
  stream.on "data", (data) -> buffer += data
  stream.on "end", -> callback? buffer

each = ([values...], callback) ->
  do proceed = -> callback values.shift(), proceed

eachFile = (files, callback) ->
  traverse = (root, dir, done) ->
    fs.readdir dir, (err, entries) ->
      return callback err if err
      each entries, (entry, proceed) ->
        return done() unless entry?
        file = path.join dir, entry
        fs.stat file, (err, stat) ->
          return callback err if err
          if stat.isFile() and /\.eco$/.test file
            callback null, file, root, proceed
          else if stat.isDirectory()
            traverse root, file, proceed
          else
            proceed()

  each files, (file, proceed) ->
    return unless file?
    fs.stat file, (err, stat) ->
      return callback err if err
      if stat.isDirectory()
        traverse file, file, proceed
      else
        root = path.dirname file
        callback null, file, root, proceed

stripExtension = (name) ->
  name.replace /(\.eco)?$/, ""

compile = (infile, identifier, name, callback) ->
  fs.readFile infile, "utf8", (err, source) ->
    return callback err if err
    template = indent eco.precompile(source), 2

    callback null, """
      (function() {
        this.#{identifier} || (this.#{identifier} = {});
        this.#{identifier}[#{JSON.stringify name}] = #{template.slice 2};
      }).call(this);
    """

mkdir = (dir, callback) ->
  exec "mkdir -p #{JSON.stringify dir}", (err, stdout, stderr) ->
    callback err

compileToFile = (infile, identifier, root, outdir, callback) ->
  root = path.join root, "/"

  if root is infile.slice 0, root.length
    name = stripExtension infile.slice root.length
  else
    name = stripExtension infile

  outfile = path.join outdir ? root, name + ".js"

  mkdir path.dirname(outfile), (err) ->
    return callback err if err
    compile infile, identifier, name, (err, result) ->
      fs.writeFile outfile, result + "\n", "utf8", (err) ->
        return callback err if err
        callback null, outfile, name

exports.run = (args = process.argv.slice 2) ->
  options = parseOptions args

  if options.stdio
    printUsage() if options.files.length or options.output
    process.openStdin()
    read process.stdin, (source) ->
      sys.puts eco.precompile source

  else if options.print
    printUsage() if options.files.length isnt 1 or options.output
    infile = options.files[0]
    name = stripExtension path.basename infile

    compile infile, options.identifier, name, (err, result) ->
      throw err if err
      sys.puts result

  else
    printUsage() unless options.files.length
    eachFile options.files, (err, infile, root, proceed) ->
      throw err if err
      return unless infile?

      compileToFile infile, options.identifier, root, options.output, (err, outfile, name) ->
        throw err if err
        console.error "#{JSON.stringify name}: #{infile} -> #{outfile}"
        proceed()
