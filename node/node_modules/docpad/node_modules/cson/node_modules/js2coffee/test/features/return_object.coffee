a = ->
  console.log "Hello"
  a: 1
  b: 2
b = ->
  console.log "Hello"
  a: 1
c = ->
  a: 1
  b: 2
d = ->
  c: 3
  (
    a: 1
    b: 2
  )
