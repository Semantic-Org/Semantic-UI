#!/usr/bin/env coffee

path = require 'path'
fs = require 'fs'
{convert} = require './convert'


exports.main = ->
  [interpreter, script, args...] = process.argv

  usage = ->
    console.log """
      Usage:
        #{path.basename(script)} [options] <html-file>

        --prefix=<string>   Prepends a string to each element function call
        --no-prefix         Disables prefix (default)
        --selectors         Output css-selectors for id and classes (default)
        --no-selectors      Disables output of css-selectors for id and classes
        --export[=<name>]   Wraps the output in a Node.js style export
        --no-export         Disables wrapping the output in an export (default)
    """
    process.exit 1

  prefix = null
  export_ = null
  selectors = null
  sourceFile = null

  for arg in args
    match = arg.match(/^--([a-z-]+)(=(.+))?$/i)
    if match
      key = match[1]
      value = match[3]
      rejectValue = ->
        if value
          console.log "Unexpected value for boolean flag #{key}"
          process.exit 1
      requireValue = ->
        unless value
          console.log "Expected value for switch #{key}"
          process.exit 1
      switch key
        when 'prefix'
          requireValue()
          prefix = value
        when 'no-prefix'
          rejectValue()
          prefix = null
        when 'selectors'
          rejectValue()
          selectors = true
        when 'no-selectors'
          rejectValue()
          selectors = false
        when 'export'
          export_ = value ? true
        when 'no-export'
          rejectValue()
          export_ = false
        else
          console.log "Unknown switch #{key}"
          process.exit 1
    else if sourceFile
      usage()
    else
      sourceFile = arg

  unless sourceFile?
    usage()

  html = fs.readFileSync sourceFile, 'utf8'
  options = {prefix, selectors, export: export_}
  convert html, process.stdout, options, (err) ->
    console.error err if err
