{compile, precompile} = require "./compiler"
{preprocess} = require "./preprocessor"


module.exports = eco = (source) ->
  if eco.cache
    eco.cache[source] ?= compile source
  else
    compile source

eco.cache = {}

eco.preprocess = preprocess

eco.precompile = precompile

eco.compile = compile

eco.render = (source, data) ->
  (eco source) data


if require.extensions
  require.extensions[".eco"] = (module, filename) ->
    source = require("fs").readFileSync filename, "utf-8"
    module._compile "module.exports = #{precompile source}", filename
