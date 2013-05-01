ifChecks = ->
  yep  if x
  yep  unless x
ifNullChecks = ->
  yep  unless x?
  nah  if x is null
voidChecks = ->
  yep  unless x?
  nah  if x is undefined
  yep  unless x?
undefinedChecks = ->
  nah  if typeof x is "undefined"
edgeCase = ->
  nah  if not x is y
unlessChecks = ->
  yep  if x?
  nah  if x isnt null
  wat  unless typeof x is "undefined"
whileAndFor = ->
  yep  until x?
  yep  while x is null
  a
  while not x?
    yep
    2
