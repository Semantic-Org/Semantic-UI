{StringScanner} = require "strscan"
{trim}          = require "./util"

module.exports = class Scanner
  @modePatterns:
    data:    /(.*?)(<%%|<%\s*(\#)|<%(([=-])?)|\n|$)/
    code:    /(.*?)((((:|(->|=>))\s*))?%>|\n|$)/
    comment: /(.*?)(%>|\n|$)/

  @dedentablePattern: /^(end|when|else|catch|finally)(?:\W|$)/

  @scan: (source) ->
    tokens  = []
    scanner = new Scanner source
    until scanner.done
      scanner.scan (token) -> tokens.push token
    tokens

  constructor: (source) ->
    @source  = source.replace /\r\n?/g, "\n"
    @scanner = new StringScanner @source
    @mode    = "data"
    @buffer  = ""
    @lineNo  = 1
    @done    = no

  scan: (callback) ->
    if @done
      callback()

    else if @scanner.hasTerminated()
      @done = yes
      switch @mode
        when "data"
          callback ["printString", @flush()]
        when "code"
          callback ["fail", "unexpected end of template"]

    else
      @advance()
      switch @mode
        when "data"
          @scanData callback
        when "code"
          @scanCode callback
        when "comment"
          @scanComment callback

  advance: ->
    @scanner.scanUntil Scanner.modePatterns[@mode]
    @buffer   += @scanner.getCapture 0
    @tail      = @scanner.getCapture 1
    @comment   = @scanner.getCapture 2
    @directive = @scanner.getCapture 4
    @arrow     = @scanner.getCapture 5

  scanData: (callback) ->
    if @tail is "<%%"
      @buffer += "<%"
      @scan callback

    else if @tail is "\n"
      @buffer += @tail
      @lineNo++
      @scan callback

    else if @tail
      callback ["printString", @flush()]
      if @comment
        @mode = "comment"
      else
        @mode = "code"
        callback ["beginCode", print: @directive?, safe: @directive is "-"]

  scanCode: (callback) ->
    if @tail is "\n"
      callback ["fail", "unexpected newline in code block"]

    else if @tail
      @mode = "data"
      code  = trim @flush()
      code += " #{@arrow}" if @arrow

      callback ["dedent"] if @isDedentable code
      callback ["recordCode", code]
      callback ["indent", @arrow] if @directive

  scanComment: (callback) ->
    if @tail is "\n"
      callback ["fail", "unexpected newline in code block"]

    else if @tail
      @mode   = "data"
      @buffer = ""

  flush: ->
    buffer  = @buffer
    @buffer = ""
    buffer

  isDedentable: (code) ->
    code.match Scanner.dedentablePattern

