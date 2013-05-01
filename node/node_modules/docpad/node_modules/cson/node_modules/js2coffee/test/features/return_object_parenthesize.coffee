parenthesized = ->
  return (
    a: 1
    b: 2
  )
  a()
not_parenthesized = ->
  return a: 1
  a()
parenthesized_b = ->
  if something()
    a: 1
    b: 2
parenthesized_c = ->
  if something()
    return (
      a: 1
      b: 2
    )
  a()
