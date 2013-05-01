narcissus = @Narcissus or require('./narcissus_packed')
_         = @_ or require('underscore')

tokens = narcissus.definitions.tokens
parser = narcissus.parser
Node   = parser.Node

# ## Narcissus node helpers
# Some extensions to the Node class to make things easier later on.

# `left() / right()`  
# These are aliases for the first and last child.
# Often helpful for things like binary operators.
Node::left  = -> @children[0]
Node::right = -> @children[1]
Node::last  = -> @children[@children.length-1]

# `walk()`  
# Traverses down a node and it's children.
Node::walk  = (options, fn, parent=null, list=null) ->
  fn parent, @, list  if parent

  if options.last
    @last().walk options, fn, @  if @last()?

  @thenPart.walk options, fn, @, 'thenPart'  if @thenPart?
  @elsePart.walk options, fn, @, 'elsePart'  if @elsePart?

  if @cases
    _.each @cases, (item) ->
      item.statements.walk options, fn, item, 'cases'

# `clone()`  
# Clones a given node.
Node::clone = (hash) ->
  for i of @
    continue  if i in ['tokenizer', 'length', 'filename']
    hash[i] ?= @[i]

  new Node(@tokenizer, hash)

# `toHash()` + `inspect()`  
# For debugging
Node::toHash = ->
  hash = {}

  toHash = (what) ->
    return null  unless what
    if what.toHash then what.toHash() else what

  hash.type = @typeName()
  hash.src  = @src()

  for i of @
    continue  if i in ['filename', 'length', 'type', 'start', 'end', 'tokenizer', 'lineno']
    continue  if typeof @[i] == 'function'
    continue  unless @[i]

    if @[i].constructor == Array
      hash[i] = _.map(@[i], (item) -> toHash(item))

    else
      hash[i] = toHash(@[i])

  hash

Node::inspect = ->
  JSON.stringify @toHash(), null, '  '

# `src()`  
# Returns the source for the node.
Node::src   = -> @tokenizer.source.substr(@start, @end-@start)

# `typeName()`  
# Returns the typename in lowercase. (eg, 'function')
Node::typeName = -> Types[@type]

# `isA()`  
# Typename check.
Node::isA = (what...) -> Types[@type] in what

# ## Types
# The `Types` global object contains a map of Narcissus type numbers to type
# names. It probably looks like:
#
#     Types = { ...
#       '42': 'script',
#       '43': 'block',
#       '44': 'label',
#       '45': 'for_in',
#       ...
#     }

Types = do ->
  dict = {}
  last = 0
  for i of tokens
    if typeof tokens[i] == 'number'
      dict[tokens[i]] = i.toLowerCase()
      last = tokens[i]

  # Now extend it with a few more
  dict[++last] = 'call_statement'
  dict[++last] = 'existence_check'

  dict

# Inverse of Types
Typenames = do ->
  dict = {}
  for i of Types
    dict[Types[i]] = i

  dict

# ## Unsupported Error exception

@NodeExt = exports = {Types, Typenames, Node}
module.exports = exports  if module?

