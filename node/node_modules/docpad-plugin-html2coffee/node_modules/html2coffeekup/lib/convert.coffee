{inspect} = require 'util'
htmlparser = require 'htmlparser'

stringLiteral = (html) ->
  inspect html.trim()

exports.convert = (html, stream, options, callback) ->

  if typeof options == 'function'
    [options, callback] = [{}, options]
  if not callback
    callback = (->)

  prefix = options.prefix ? ''
  selectors = options.selectors ? true
  export_ = options.export ? false

  depth = 0

  emit = (code) ->
    stream.write Array(depth + 1).join('  ') + code + '\n'

  nest = (fn) ->
    depth++
    result = fn()
    depth--
    result

  visit =

    node: (node) ->
      visit[node.type](node)

    array: (array) ->
      for node in array
        visit.node node

    tag: (tag) ->
      code = prefix + tag.name
      called = false

      # Force attribute ordering of `id`, `class`, then others.
      attribs = []
      if tag.attribs?
        extractAttrib = (key) ->
          value = tag.attribs[key]
          if value
            attribs.push [key, value] unless selectors
            delete tag.attribs[key]
          value
        id = extractAttrib 'id'
        cls = extractAttrib 'class'
        if selectors and (id or cls)
          selector = ''
          selector += "##{id}" if id
          selector += ".#{cls.replace(' ', '.')}" if cls
          code += " '#{selector}'"
          called = true
        for key, value of tag.attribs
          attribs.push [key, value]

      # Render attributes
      attribs = for [key, value] in attribs
        " #{key}: #{stringLiteral value}"
      code += attribs.join(',')
      called ||= attribs.length > 0

      # Render content
      endTag = (suffix) =>
        if suffix
          code += ',' if called
          code += suffix
        emit code
      if (children = tag.children)?
        if children.length == 1 and children[0].type == 'text'
          endTag " #{stringLiteral children[0].data}"
        else
          endTag ' ->'
          nest -> visit.array children
      else if called
        endTag()
      else
        endTag('()')

    text: (text) ->
      return if text.data.match /^\s*$/
      emit "#{prefix}text #{stringLiteral text.data}"

    directive: (directive) ->
      if directive.name.toLowerCase() == '!doctype'
        emit "#{prefix}doctype TODO" #TODO: Extract doctype
      else
        console.error "Unknown directive: #{inspect directive.name}"

    comment: (comment) ->
      emit "#{prefix}comment #{stringLiteral comment.data}"

    script: (script) ->
      visit.tag script #TODO: Something better

    style: (style) ->
      visit.tag style #TODO: Something better

  handler = new htmlparser.DefaultHandler (err, dom) =>
    return callback err if err
    try
      if export_
        if export_ == true
          emit 'module.exports = ->'
        else
          emit "exports.#{export_} = ->"
        nest -> visit.array dom
      else
        visit.array dom
    catch exception
      err = exception
    callback err

  try
    parser = new htmlparser.Parser(handler)
    parser.parseComplete(html)
  catch exception
    callback exception
