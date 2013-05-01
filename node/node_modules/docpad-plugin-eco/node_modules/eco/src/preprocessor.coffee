Scanner = require "./scanner"
util    = require "./util"

module.exports = class Preprocessor
  @preprocess: (source) ->
    preprocessor = new Preprocessor source
    preprocessor.preprocess()

  constructor: (source) ->
    @scanner  = new Scanner source
    @output   = ""
    @level    = 0
    @options  = {}
    @captures = []

  preprocess: ->
    until @scanner.done
      @scanner.scan (token) =>
        @[token[0]].apply @, token.slice 1
    @output

  record: (line) ->
    @output += util.repeat "  ", @level
    @output += line + "\n"

  printString: (string) ->
    if string.length
      @record "__out.push #{util.inspectString string}"

  beginCode: (options) ->
    @options = options

  recordCode: (code) ->
    if code isnt "end"
      if @options.print
        if @options.safe
          @record "__out.push #{code}"
        else
          @record "__out.push __sanitize #{code}"
      else
        @record code

  indent: (capture) ->
    @level++
    if capture
      @record "__capture #{capture}"
      @captures.unshift @level
      @indent()

  dedent: ->
    @level--
    @fail "unexpected dedent" if @level < 0
    if @captures[0] is @level
      @captures.shift()
      @dedent()

  fail: (message) ->
    throw "Parse error on line #{@scanner.lineNo}: #{message}"
