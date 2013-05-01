# **StringScanner** is a simple string tokenizer that provides for lexical
# scanning operations on a string. It's a JavaScript port of the [Ruby
# library with the same name](http://ruby-doc.org/core/classes/StringScanner.html).
#
# Scanning a string means keeping track of and advancing a position (a
# zero-based index into the source string) and matching regular expressions
# against the portion of the source string after the position.
#
# StringScanner is written in [CoffeeScript](http://coffeescript.org/) and
# distributed via [npm](http://npm.mape.me/) as a [CommonJS
# module](http://www.commonjs.org/).
#
# [Clone, fork, or file bugs at GitHub](http://github.com/sstephenson/strscan-js).
#
#### Quick start
# -------------------------------------------------------------------------
#
#     $ npm install strscan
#     $ node-repl
#     > var StringScanner = require("strscan").StringScanner
#     > var s = new StringScanner("This is a test")
#     > s.scan(/\w+/)             # => "This"
#     > s.scan(/\w+/)             # => null
#     > s.scan(/\s+/)             # => " "
#     > s.scan(/\s+/)             # => null
#     > s.scan(/\w+/)             # => "is"
#     > s.hasTerminated()         # => false
#     > s.scan(/\s+/)             # => " "
#     > s.scan(/(\w+)\s+(\w+)/)   # => "a test"
#     > s.getMatch()              # => "a test"
#     > s.getCapture(0)           # => "a"
#     > s.getCapture(1)           # => "test"
#     > s.hasTerminated()         # => true

#### Creating a scanner
# -------------------------------------------------------------------------

# Create a new `StringScanner` with a source string.
(exports ? this).StringScanner = class StringScanner
  constructor: (source) ->
    @source = source.toString()
    @reset()


#### Scanning for matches
# The `scan`, `scanUntil`, `scanChar`, `skip`, and `skipUntil` methods look
# for matching strings and advance the scanner's position. The _scan_
# methods return the matched string; the _skip_ methods return the number
# of characters by which the scan position advanced.
# -------------------------------------------------------------------------

  # Matches `regexp` at the current position. Returns the matched string
  # and advances the scanner's position, or returns `null` if there is no
  # match.
  scan: (regexp) ->
    if (matches = regexp.exec @getRemainder()) and matches.index is 0
      @setState matches,
        head: @head + matches[0].length
        last: @head
    else
      @setState []

  # Matches `regexp` at _or after_ the current position. Returns the
  # portion of the source string after the scanner's position up to and
  # including the end of the match and advances the scanner's position,
  # or returns `null` if there is no match.
  scanUntil: (regexp) ->
    if matches = regexp.exec @getRemainder()
      @setState matches,
        head: @head + matches.index + matches[0].length
        last: @head
      @source.slice @last, @head
    else
      @setState []

  # Scans one character, returns it, and advances the scanner's position.
  scanChar: ->
    @scan /[\s\S]/

  # Skips over the given `regexp` at the current position. Returns the
  # length of the matched string and advances the scanner's position, or
  # returns `null` if there is no match.
  skip: (regexp) ->
    @match.length if @scan regexp

  # Skips over the given `regexp` at _or after_ the current position.
  # Returns the length of the string up to and including the end of the
  # match and advances the scanner's position, or returns `null` if there
  # is no match.
  skipUntil: (regexp) ->
    @head - @last if @scanUntil regexp


#### Looking ahead
# The `check`, `checkUntil` and `peek` methods look for matching strings
# without advancing the scanner's position.
# -------------------------------------------------------------------------

  # Checks to see if `regexp` can be matched at the current position and
  # returns the matched string without advancing the scanner's position, or
  # returns `null` if there is no match.
  check: (regexp) ->
    if (matches = regexp.exec @getRemainder()) and matches.index is 0
      @setState matches
    else
      @setState []

  # Checks to see if `regexp` can be matched at _or after_ the current
  # position. Returns the portion of the source string after the current
  # position up to and including the end of the match without advancing the
  # scanner's position, or returns `null` if there is no match.
  checkUntil: (regexp) ->
    if matches = regexp.exec @getRemainder()
      @setState matches
      @source.slice @head, @head + matches.index + matches[0].length
    else
      @setState []

  # Returns the next `length` characters after the current position. If
  # called without a `length`, returns the next character. The scanner's
  # position is not advanced.
  peek: (length) ->
    @source.substr @head, length ? 1


#### Accessing scanner data
# The `getSource`, `getRemainder`, `getPosition` and `hasTerminated`
# methods provide information about the scanner's source string and
# position.
# -------------------------------------------------------------------------

  # Returns the scanner's source string.
  getSource: ->
    @source

  # Returns the portion of the source string from the scanner's position
  # onward.
  getRemainder: ->
    @source.slice @head

  # Returns the scanner's position. In the _reset_ position, this value is
  # zero. In the _terminated_ position, this value is the length of the
  # source string.
  getPosition: ->
    @head

  # Checks to see if the scanner has reached the end of the string.
  hasTerminated: ->
    @head is @source.length


#### Accessing match data
# The `getPreMatch`, `getMatch`, `getPostMatch` and `getCapture` methods
# provide information about the most recent match.
# -------------------------------------------------------------------------

  # Returns the portion of the source string leading up to, but not
  # including, the most recent match. (Returns `null` if there is no recent
  # match.)
  getPreMatch: ->
    @source.slice 0, @head - @match.length if @match

  # Returns the most recently matched portion of the source string (or
  # `null` if there is no recent match).
  getMatch: ->
    @match

  # Returns the portion of the source string immediately following the most
  # recent match. (Returns `null` if there is no recent match.)
  getPostMatch: ->
    @source.slice @head if @match

  # Returns the `index`th capture from the most recent match (or `null` if
  # there is no recent match).
  getCapture: (index) ->
    @captures[index]


#### Modifying the scanner's state
# The `reset`, `terminate`, `concat` and `unscan` methods let you change
# the state of the scanner.
# -------------------------------------------------------------------------

  # Resets the scanner back to its original position and clears its match
  # data.
  reset: ->
    @setState [], head: 0, last: 0

  # Advances the scanner position to the end of the string and clears its
  # match data.
  terminate: ->
    @setState [], head: @source.length, last: @head

  # Appends `string` to the scanner's source string. The scanner's position
  # is not affected.
  concat: (string) ->
    @source += string

  # Sets the scanner's position to its previous position and clears its
  # match data. Only one previous position is stored. Throws an exception
  # if there is no previous position.
  unscan: ->
    if @match
      @setState [], head: @last, last: 0
    else
      throw "nothing to unscan"


##### Private methods

  # Sets the state of the scanner (for internal use only).
  setState: (matches, values) ->
    @head     = values?.head ? @head
    @last     = values?.last ? @last
    @captures = matches.slice 1
    @match    = matches[0]

