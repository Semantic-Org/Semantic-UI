exports.repeat = repeat = (string, count) ->
  Array(count + 1).join string

exports.indent = (string, width) ->
  space = repeat " ", width
  lines = (space + line for line in string.split "\n")
  lines.join "\n"

exports.trim = (string) ->
  string
    .replace(/^\s+/, "")
    .replace(/\s+$/, "")

specialCharacters =
  '\\': '\\\\'
  '\b': '\\b'
  '\f': '\\f'
  '\n': '\\n'
  '\r': '\\r'
  '\t': '\\t'

exports.inspectString = (string) ->
  contents = string.replace /[\x00-\x1f\\]/g, (character) ->
    if character of specialCharacters
      specialCharacters[character]
    else
      code = character.charCodeAt(0).toString(16)
      code = "0#{code}" if code.length is 1
      "\\u00#{code}"
  "'" + contents.replace(/'/g, '\\\'') + "'"
