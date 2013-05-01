# The JavaScript to CoffeeScript compiler.
# Common usage:
#
#
#     var src = "var square = function(n) { return n * n };"
#
#     js2coffee = require('js2coffee');
#     js2coffee.build(src);
#     //=> "square = (n) -> n * n"

# ## Requires
#
# Js2coffee relies on Narcissus's parser. (Narcissus is Mozilla's JavaScript
# engine written in JavaScript).

{parser} = @Narcissus or require('./narcissus_packed')

_ = @_ or require('underscore')

{Types, Typenames, Node} = @NodeExt or require('./node_ext')

{Code, p, strEscape, unreserve, unshift, isSingleLine, trim, blockTrim,
  ltrim, rtrim, strRepeat, paren, truthy} = @Js2coffeeHelpers or require('./helpers')

# ## Main entry point
# This is `require('js2coffee').build()`. It takes a JavaScript source
# string as an argument, and it returns the CoffeeScript version.
#
# 1. Ask Narcissus to break it down into Nodes (`parser.parse`). This
#    returns a `Node` object of type `script`.
#
# 2. This node is now passed onto `Builder#build()`.

buildCoffee = (str) ->
  str  = str.replace /\r/g, ''
  str += "\n"

  builder    = new Builder
  scriptNode = parser.parse str

  output = trim builder.build(scriptNode)
  (rtrim line for line in output.split('\n')).join('\n')

# ## Builder class
# This is the main class that proccesses the AST and spits out streng.
# See the `buildCoffee()` function above for info on how this is used.

class Builder
  constructor: ->
    @transformer = new Transformer

  # `build()`  
  # The main entry point.

  # This finds the appropriate @builder function for `node` based on it's type,
  # the passes the node onto that function.
  #
  # For instance, for a `function` node, it calls `@builders.function(node)`.
  # It defaults to `@builders.other` if it can't find a function for it.

  build: (args...) ->
    node = args[0]
    @transform node

    name = 'other'
    name = node.typeName()  if node != undefined and node.typeName

    fn  = (@[name] or @other)
    out = fn.apply(this, args)

    if node.parenthesized then paren(out) else out

  # `transform()`  
  # Perform a transformation on the node, if a transformation function is
  # available.

  transform: (args...) ->
    @transformer.transform.apply(@transformer, args)

  # `body()`
  # Works like `@build()`, and is used for code blocks. It cleans up the returned
  # code block by removing any extraneous spaces and such.
  
  body: (node, opts={}) ->
    str = @build(node, opts)
    str = blockTrim(str)
    str = unshift(str)
  
    if str.length > 0 then str else ""

  # ## The builders
  #
  # Each of these method are passed a Node, and is expected to return
  # a string representation of it CoffeeScript counterpart.
  #
  # These are invoked using the main entry point, `Builder#build()`.

  # `script`  
  # This is the main entry point.

  'script': (n, opts={}) ->
    c = new Code

    # *Functions must always be declared first in a block.*
    _.each n.functions,    (item) => c.add @build(item)
    _.each n.nonfunctions, (item) => c.add @build(item)

    c.toString()

  # `property_identifier`  
  # A key in an object literal.

  'property_identifier': (n) ->
    str = n.value.toString()

    # **Caveat:**
    # *In object literals like `{ '#foo click': b }`, ensure that the key is
    # quoted if need be.*

    if str.match(/^([_\$a-z][_\$a-z0-9]*)$/i) or str.match(/^[0-9]+$/i)
      str
    else
      strEscape str

  # `identifier`  
  # Any object identifier like a variable name.

  'identifier': (n) ->
    if n.value is 'undefined'
      '`undefined`'
    else if n.property_accessor
      n.value.toString()
    else
      unreserve n.value.toString()

  'number': (n) ->
    "#{n.src()}"

  'id': (n) ->
    if n.property_accessor
      n
    else
      unreserve n

  # `id_param`  
  # Function parameters. Belongs to `list`.

  'id_param': (n) ->
    if n.toString() in ['undefined']
      "#{n}_"
    else
      @id n

  # `return`  
  # A return statement. Has `n.value` of type `id`.

  'return': (n) ->
    if not n.value?
      "return\n"

    else
      "return #{@build(n.value)}\n"

  # `;` (aka, statement)  
  # A single statement.

  ';': (n) ->
    # **Caveat:**
    # Some statements can be blank as some people are silly enough to use `;;`
    # sometimes. They should be ignored.

    unless n.expression?
      ""

    else if n.expression.typeName() == 'object_init'
      src = @object_init(n.expression)
      if n.parenthesized
        src
      else
        "#{unshift(blockTrim(src))}\n"

    else
      @build(n.expression) + "\n"

  # `new` + `new_with_args`  
  # For `new X` and `new X(y)` respctively.

  'new': (n) -> "new #{@build n.left()}"
  'new_with_args': (n) -> "new #{@build n.left()}(#{@build n.right()})"

  # ### Unary operators

  'unary_plus': (n) -> "+#{@build n.left()}"
  'unary_minus': (n) -> "-#{@build n.left()}"

  # ### Keywords

  'this': (n) -> 'this'
  'null': (n) -> 'null'
  'true': (n) -> 'true'
  'false': (n) -> 'false'
  'void': (n) -> 'undefined'

  'debugger': (n) -> "debugger\n"
  'break': (n) -> "break\n"
  'continue': (n) -> "continue\n"

  # ### Some simple operators

  '~': (n) -> "~#{@build n.left()}"
  'typeof': (n) -> "typeof #{@build n.left()}"
  'index': (n) ->
    right = @build n.right()
    if _.any(n.children, (child) -> child.typeName() == 'object_init' and child.children.length > 1)
      right = "{#{right}}"
    "#{@build n.left()}[#{right}]"

  'throw': (n) -> "throw #{@build n.exception}"

  '!': (n) ->
    target = n.left()
    negations = 1
    ++negations while (target.isA '!') and target = target.left()
    if (negations & 1) and target.isA '==', '!=', '===', '!==', 'in', 'instanceof' # invertible binary operators
      target.negated = not target.negated
      return @build target
    "#{if negations & 1 then 'not ' else '!!'}#{@build target}"

  # ### Binary operators
  # All of these are rerouted to the `binary_operator` @builder.

  # TODO: make a function that generates these functions, invoked like so:
  #   in: binop 'in', 'of'
  #   '+': binop '+'
  #   and so on...

  in: (n) ->    @binary_operator n, 'of'
  '+': (n) ->   @binary_operator n, '+'
  '-': (n) ->   @binary_operator n, '-'
  '*': (n) ->   @binary_operator n, '*'
  '/': (n) ->   @binary_operator n, '/'
  '%': (n) ->   @binary_operator n, '%'
  '>': (n) ->   @binary_operator n, '>'
  '<': (n) ->   @binary_operator n, '<'
  '&': (n) ->   @binary_operator n, '&'
  '|': (n) ->   @binary_operator n, '|'
  '^': (n) ->   @binary_operator n, '^'
  '&&': (n) ->  @binary_operator n, 'and'
  '||': (n) ->  @binary_operator n, 'or'
  '<<': (n) ->  @binary_operator n, '<<'
  '<=': (n) ->  @binary_operator n, '<='
  '>>': (n) ->  @binary_operator n, '>>'
  '>=': (n) ->  @binary_operator n, '>='
  '===': (n) -> @binary_operator n, 'is'
  '!==': (n) -> @binary_operator n, 'isnt'
  '>>>': (n) ->  @binary_operator n, '>>>'
  instanceof: (n) -> @binary_operator n, 'instanceof'

  '==': (n) ->
    # TODO: throw warning
    @binary_operator n, 'is'

  '!=': (n) ->
    # TODO: throw warning
    @binary_operator n, 'isnt'

  'binary_operator': do ->
    INVERSIONS =
      is: 'isnt'
      in: 'not in'
      of: 'not of'
      instanceof: 'not instanceof'
    INVERSIONS[v] = k for own k, v of INVERSIONS
    (n, sign) ->
      sign = INVERSIONS[sign] if n.negated
      "#{@build n.left()} #{sign} #{@build n.right()}"

  # ### Increments and decrements
  # For `a++` and `--b`.

  '--': (n) -> @increment_decrement n, '--'
  '++': (n) -> @increment_decrement n, '++'

  'increment_decrement': (n, sign) ->
    if n.postfix
      "#{@build n.left()}#{sign}"
    else
      "#{sign}#{@build n.left()}"

  # `=` (aka, assignment)  
  # For `a = b` (but not `var a = b`: that's `var`).

  '=': (n) ->
    sign = if n.assignOp?
      Types[n.assignOp] + '='
    else
      '='

    "#{@build n.left()} #{sign} #{@build n.right()}"

  # `,` (aka, comma)  
  # For `a = 1, b = 2'

  ',': (n) ->
    list = _.map n.children, (item) => @build(item) + "\n"
    list.join('')

  # `regexp`  
  # Regular expressions.

  'regexp': (n) ->
    m     = n.value.toString().match(/^\/(.*)\/([a-z]?)/)
    value = m[1]
    flag  = m[2]

    # **Caveat:**
    # *If it begins with `=` or a space, the CoffeeScript parser will choke if
    # it's written as `/=/`. Hence, they are written as `new RegExp('=')`.*

    begins_with = value[0]

    if begins_with in [' ', '=']
      if flag.length > 0
        "RegExp(#{strEscape value}, \"#{flag}\")"
      else
        "RegExp(#{strEscape value})"
    else
      "/#{value}/#{flag}"

  'string': (n) ->
    strEscape n.value

  # `call`  
  # A Function call.
  # `n.left` is an `id`, and `n.right` is a `list`.

  'call': (n) ->
    if n.right().children.length == 0
      "#{@build n.left()}()"
    else
      "#{@build n.left()}(#{@build n.right()})"

  # `call_statement`  
  # A `call` that's on it's own line.

  'call_statement': (n) ->
    left = @build n.left()

    # **Caveat:**
    # *When calling in this way: `function () { ... }()`,
    # ensure that there are parenthesis around the anon function
    # (eg, `(-> ...)()`).*

    left = paren(left)  if n.left().isA('function')

    if n.right().children.length == 0
      "#{left}()"
    else
      "#{left} #{@build n.right()}"

  # `list`  
  # A parameter list.

  'list': (n) ->
    list = _.map(n.children, (item) =>
      if n.children.length > 1
        item.is_list_element = true
      @build(item))

    list.join(", ")

  'delete': (n) ->
    ids = _.map(n.children, (el) => @build(el))
    ids = ids.join(', ')
    "delete #{ids}\n"

  # `.` (scope resolution?)  
  # For instances such as `object.value`.

  '.': (n) ->
    # **Caveat:**
    # *If called as `this.xxx`, it should use the at sign (`n.xxx`).*

    # **Caveat:**
    # *If called as `x.prototype`, it should use double colons (`x::`).*

    left  = @build n.left()
    right_obj = n.right()
    right_obj.property_accessor = true
    right = @build right_obj

    if n.isThis and n.isPrototype
      "@::"
    else if n.isThis
      "@#{right}"
    else if n.isPrototype
      "#{left}::"
    else if n.left().isPrototype
      "#{left}#{right}"
    else
      "#{left}.#{right}"

  'try': (n) ->
    c = new Code
    c.add 'try'
    c.scope @body(n.tryBlock)

    _.each n.catchClauses, (clause) =>
      c.add @build(clause)

    if n.finallyBlock?
      c.add "finally"
      c.scope @body(n.finallyBlock)

    c

  'catch': (n) ->
    body_ = @body(n.block)
    return '' if trim(body_).length == 0

    c = new Code

    if n.varName?
      c.add "catch #{n.varName}"
    else
      c.add 'catch'

    c.scope @body(n.block)
    c

  # `?` (ternary operator)  
  # For `a ? b : c`. Note that these will always be parenthesized, as (I
  # believe) the order of operations in JS is different in CS.

  '?': (n) ->
    "(if #{@build n.left()} then #{@build n.children[1]} else #{@build n.children[2]})"

  'for': (n) ->
    c = new Code

    if n.setup?
      c.add "#{@build n.setup}\n"

    if n.condition?
      c.add "while #{@build n.condition}\n"
    else
      c.add "loop"

    c.scope @body(n.body)
    c.scope @body(n.update)  if n.update?
    c

  'for_in': (n) ->
    c = new Code

    c.add "for #{@build n.iterator} of #{@build n.object}"
    c.scope @body(n.body)
    c

  'while': (n) ->
    c = new Code

    keyword   = if n.positive then "while" else "until"
    body_     = @body(n.body)

    # *Use `loop` whin something will go on forever (like `while (true)`).*
    if truthy(n.condition)
      statement = "loop"
    else
      statement = "#{keyword} #{@build n.condition}"

    if isSingleLine(body_) and statement isnt "loop"
      c.add "#{trim body_}  #{statement}\n"
    else
      c.add statement
      c.scope body_
    c

  'do': (n) ->
    c = new Code

    c.add "loop"
    c.scope @body(n.body)
    c.scope "break unless #{@build n.condition}"  if n.condition?

    c

  'if': (n) ->
    c = new Code

    keyword = if n.positive then "if" else "unless"
    body_   = @body(n.thenPart)
    n.condition.parenthesized = false

    # *Account for `if (xyz) {}`, which should be `xyz`. (#78)*
    # *Note that `!xyz` still compiles to `xyz` because the `!` will not change anything.*
    if n.thenPart.isA('block') and n.thenPart.children.length == 0 and !n.elsePart?
      console.log n.thenPart
      c.add "#{@build n.condition}\n"

    else if isSingleLine(body_) and !n.elsePart?
      c.add "#{trim body_}  #{keyword} #{@build n.condition}\n"

    else
      c.add "#{keyword} #{@build n.condition}"
      c.scope @body(n.thenPart)

      if n.elsePart?
        if n.elsePart.typeName() == 'if'
          c.add "else #{@build(n.elsePart).toString()}"
        else
          c.add "else\n"
          c.scope @body(n.elsePart)

    c

  'switch': (n) ->
    c = new Code

    c.add "switch #{@build n.discriminant}\n"

    fall_through = false
    _.each n.cases, (item) =>
      if item.value == 'default'
        c.scope "else"
      else
        if fall_through == true
          c.add ", #{@build item.caseLabel}\n"
        else
          c.add "  when #{@build item.caseLabel}"
          
      if @body(item.statements).length == 0
        fall_through = true
      else
        fall_through = false
        c.add "\n"
        c.scope @body(item.statements), 2

      first = false

    c

  'existence_check': (n) ->
    "#{@build n.left()}?"

  'array_init': (n) ->
    if n.children.length == 0
      "[]"
    else
      "[ #{@list n} ]"

  # `property_init`  
  # Belongs to `object_init`;
  # left is a `identifier`, right can be anything.

  'property_init': (n) ->
    left = n.left()
    right = n.right()
    right.is_property_value = true
    "#{@property_identifier left}: #{@build right}"

  # `object_init`  
  # An object initializer.
  # Has many `property_init`.

  'object_init': (n, options={}) ->
    if n.children.length == 0
      "{}"

    else if n.children.length == 1 and not (n.is_property_value or n.is_list_element)
      @build n.children[0]

    else
      list = _.map n.children, (item) => @build item

      c = new Code
      c.scope list.join("\n")
      c = "{#{c}}"  if options.brackets?
      c

  # `function`  
  # A function. Can be an anonymous function (`function () { .. }`), or a named
  # function (`function name() { .. }`).

  'function': (n) ->
    c = new Code

    params = _.map n.params, (str) =>
      if str.constructor == String
        @id_param str
      else
        @build str

    if n.name
      c.add "#{n.name} = "

    if n.params.length > 0
      c.add "(#{params.join ', '}) ->"
    else
      c.add "->"

    body = @body(n.body)
    if trim(body).length > 0
      c.scope body
    else
      c.add "\n"

    c

  'var': (n) ->
    list = _.map n.children, (item) =>
      "#{unreserve item.value} = #{if item.initializer? then @build(item.initializer) else 'undefined'}"

    _.compact(list).join("\n") + "\n"

  # ### Unsupported things
  #
  # Due to CoffeeScript limitations, the following things are not supported:
  #
  #  * New getter/setter syntax (`x.prototype = { get name() { ... } };`)
  #  * Break labels (`my_label: ...`)
  #  * Constants

  'other': (n) ->   @unsupported n, "#{n.typeName()} is not supported yet"
  'getter': (n) ->  @unsupported n, "getter syntax is not supported; use __defineGetter__"
  'setter': (n) ->  @unsupported n, "setter syntax is not supported; use __defineSetter__"
  'label': (n) ->   @unsupported n, "labels are not supported by CoffeeScript"
  'const': (n) ->   @unsupported n, "consts are not supported by CoffeeScript"

  'block': (args...) ->
    @script.apply @, args

  # `unsupported()`  
  # Throws an unsupported error.
  'unsupported': (node, message) ->
    throw new UnsupportedError("Unsupported: #{message}", node)

# ## AST manipulation
# Manipulation of the abstract syntax tree happens here. All these are done on
# the `build()` step, done just before a node is passed onto `Builders`.

class Transformer
  transform: (args...) ->
    node = args[0]
    return  if node.transformed?
    type = node.typeName()
    fn = @[type]

    if fn
      fn.apply(this, args)
      node.transformed = true

  'script': (n) ->
    n.functions    = []
    n.nonfunctions = []

    _.each n.children, (item) =>
      if item.isA('function')
        n.functions.push item
      else
        n.nonfunctions.push item

    last = null

    # *Statements don't need parens, unless they are consecutive object
    # literals.*
    _.each n.nonfunctions, (item) =>
      if item.expression?
        expr = item.expression

        if last?.isA('object_init') and expr.isA('object_init')
          item.parenthesized = true
        else
          item.parenthesized = false

        last = expr

  '.': (n) ->
    n.isThis      = n.left().isA('this')
    n.isPrototype = (n.right().isA('identifier') and n.right().value == 'prototype')

  ';': (n) ->
    if n.expression?
      # *Statements don't need parens.*
      n.expression.parenthesized = false

      # *If the statement only has one function call (eg, `alert(2);`), the
      # parentheses should be omitted (eg, `alert 2`).*
      if n.expression.isA('call')
        n.expression.type = Typenames['call_statement']
        @call_statement n

  'function': (n) ->
    # *Unwrap the `return`s.*
    n.body.walk last: true, (parent, node, list) ->
      if node.isA('return') and node.value
        # Hax
        lastNode = if list
          parent[list]
        else
          parent.children[parent.children.length-1]

        if lastNode
          lastNode.type = Typenames[';']
          lastNode.expression = lastNode.value

  'switch': (n) ->
    _.each n.cases, (item) =>
      block = item.statements
      ch    = block.children

      # *CoffeeScript does not need `break` statements on `switch` blocks.*
      delete ch[ch.length-1] if block.last()?.isA('break')

  'call_statement': (n) ->
    if n.children[1]
      _.each n.children[1].children, (child, i) ->
        if child.isA('function') and i != n.children[1].children.length-1
          child.parenthesized = true

  'return': (n) ->
    # *Doing "return {x:2, y:3}" should parenthesize the return value.*
    if n.value and n.value.isA('object_init') and n.value.children.length > 1
      n.value.parenthesized = true

  'block': (n) ->
    @script n

  'if': (n) ->
    # *Account for `if(x) {} else { something }` which should be `something unless x`.*
    if n.thenPart.children.length == 0 and n.elsePart?.children.length > 0
      n.positive = false
      n.thenPart = n.elsePart
      delete n.elsePart

    @inversible n

  'while': (n) ->
    # *A while with a blank body (`while(x){}`) should be accounted for.*
    # *You can't have empty blocks, so put a `continue` in there. (#78)*
    if n.body.children.length is 0
      n.body.children.push n.clone(type: Typenames['continue'], value: 'continue', children: [])

    @inversible n

  'inversible': (n) ->
    @transform n.condition
    positive = if n.positive? then n.positive else true

    # *Invert a '!='. (`if (x != y)` => `unless x is y`)*
    if n.condition.isA('!=')
      n.condition.type = Typenames['==']
      n.positive = not positive

    # *Invert a '!'. (`if (!x)` => `unless x`)*
    else if n.condition.isA('!')
      n.condition = n.condition.left()
      n.positive = not positive

    else
      n.positive = positive

  '==': (n) ->
    if n.right().isA('null', 'void')
      n.type     = Typenames['!']
      n.children = [n.clone(type: Typenames['existence_check'], children: [n.left()])]

  '!=': (n) ->
    if n.right().isA('null', 'void')
      n.type     = Typenames['existence_check']
      n.children = [n.left()]

class UnsupportedError
  constructor: (str, src) ->
    @message = str
    @cursor  = src.start
    @line    = src.lineno
    @source  = src.tokenizer.source

  toString: -> @message

# ## Exports

@Js2coffee = exports =
  version: '0.1.3'
  build: buildCoffee
  UnsupportedError: UnsupportedError

module.exports = exports  if module?
