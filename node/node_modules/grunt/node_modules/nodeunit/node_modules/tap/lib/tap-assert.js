// an assert module that returns tappable data for each assertion.
var difflet = require('difflet')
  , deepEqual = require('deep-equal')
  , bufferEqual = require('buffer-equal')
  , Buffer = require('buffer').Buffer

module.exports = assert

var syns = {}
  , id = 1

function assert (ok, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)

  //console.error("assert %j", [ok, message, extra])
  //if (extra && extra.skip) return assert.skip(message, extra)
  //console.error("assert", [ok, message, extra])
  ok = !!ok
  var res = { id : id ++, ok: ok }

  var caller = getCaller(extra && extra.error)
  if (extra && extra.error) {
    res.type = extra.error.name
    res.message = extra.error.message
    res.code = extra.error.code
             || extra.error.type
    res.errno = extra.error.errno
    delete extra.error
  }
  if (caller.file) {
    res.file = caller.file
    res.line = +caller.line
    res.column = +caller.column
  }
  res.stack = caller.stack

  res.name = message || "(unnamed assert)"

  if (extra) Object.keys(extra).forEach(function (k) {
    if (!res.hasOwnProperty(k)) res[k] = extra[k]
  })

  // strings and objects are hard to diff by eye
  if (!ok &&
      res.hasOwnProperty("found") &&
      res.hasOwnProperty("wanted") &&
      res.found !== res.wanted) {
    if (typeof res.wanted !== typeof res.found ||
        typeof res.wanted === "object" && (!res.found || !res.wanted)) {
      res.type = { found: typeof found
                 , wanted: typeof wanted }
    } else if (typeof res.wanted === "string") {
      res.diff = diffString(res.found, res.wanted)
    } else if (typeof res.wanted === "object") {
      res.diff = diffObject(res.found, res.wanted)
    }
  }

  //console.error("assert return", res)

  return res
}
assert.ok = assert
syns.ok = [ "true", "assert" ]


function notOk (ok, message, extra) {
  return assert(!ok, message, extra)
}
assert.notOk = notOk
syns.notOk = [ "false", "notok" ]

function error (er, message, extra) {
  if (!er) {
    // just like notOk(er)
    return assert(!er, message, extra)
  }
  message = message || er.message
  extra = extra || {}
  extra.error = er
  return assert.fail(message, extra)
}
assert.error = error
syns.error = [ "ifError", "ifErr", "iferror" ]


function pass (message, extra) {
  return assert(true, message, extra)
}
assert.pass = pass

function fail (message, extra) {
  //console.error("assert.fail", [message, extra])
  //if (extra && extra.skip) return assert.skip(message, extra)
  return assert(false, message, extra)
}
assert.fail = fail

function skip (message, extra) {
  //console.error("assert.skip", message, extra)
  if (!extra) extra = {}
  return { id: id ++, skip: true, name: message || "" }
}
assert.skip = skip

function throws (fn, wanted, message, extra) {
  if (typeof wanted === "string") {
    extra = message
    message = wanted
    wanted = null
  }

  if (extra && extra.skip) return assert.skip(message, extra)

  var found = null
  try {
    fn()
  } catch (e) {
    found = { name: e.name, message: e.message }
  }

  extra = extra || {}

  extra.found = found
  if (wanted) {
    wanted = { name: wanted.name, message: wanted.message }
    extra.wanted = wanted
  }

  if (!message) {
    message = "Expected to throw"
    if (wanted) message += ": "+wanted.name + " " + wanted.message
  }

  return (wanted) ? assert.similar(found, wanted, message, extra)
                  : assert.ok(found, message, extra)
}
assert.throws = throws


function doesNotThrow (fn, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  var found = null
  try {
    fn()
  } catch (e) {
    found = {name: e.name, message: e.message}
  }
  message = message || "Should not throw"

  return assert.equal(found, null, message, extra)
}
assert.doesNotThrow = doesNotThrow


function equal (a, b, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  extra = extra || {}
  message = message || "should be equal"
  extra.found = a
  extra.wanted = b
  return assert(a === b, message, extra)
}
assert.equal = equal
syns.equal = ["equals"
             ,"isEqual"
             ,"is"
             ,"strictEqual"
             ,"strictEquals"]


function equivalent (a, b, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  var extra = extra || {}
  message = message || "should be equivalent"
  extra.found = a
  extra.wanted = b

  if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
    return assert(bufferEqual(a, b), message, extra)
  } else {
    return assert(deepEqual(a, b), message, extra)
  }
}
assert.equivalent = equivalent
syns.equivalent = ["isEquivalent"
                  ,"looseEqual"
                  ,"looseEquals"
                  ,"isDeeply"
                  ,"same"
                  ,"deepEqual"
                  ,"deepEquals"]


function inequal (a, b, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  extra = extra || {}
  message = message || "should not be equal"
  extra.found = a
  extra.doNotWant = b
  return assert(a !== b, message, extra)
}
assert.inequal = inequal
syns.inequal = ["notEqual"
               ,"notEquals"
               ,"notStrictEqual"
               ,"notStrictEquals"
               ,"isNotEqual"
               ,"isNot"
               ,"not"
               ,"doesNotEqual"
               ,"isInequal"]


function inequivalent (a, b, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  extra = extra || {}
  message = message || "should not be equivalent"
  extra.found = a
  extra.doNotWant = b
  
  if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
    return assert(!bufferEqual(a, b), message, extra)
  } else {
    return assert(!deepEqual(a, b), message, extra)
  }
}
assert.inequivalent = inequivalent
syns.inequivalent = ["notEquivalent"
                    ,"notDeepEqual"
                    ,"notDeeply"
                    ,"notSame"
                    ,"isNotDeepEqual"
                    ,"isNotDeeply"
                    ,"isNotEquivalent"
                    ,"isInequivalent"]

function similar (a, b, message, extra, flip) {
  if (extra && extra.skip) return assert.skip(message, extra)
  // test that a has all the fields in b
  message = message || "should be similar"

  if (typeof a === "string" &&
      (Object.prototype.toString.call(b) === "[object RegExp]")) {
    extra = extra || {}
    extra.pattern = b
    extra.string = a
    var ok = a.match(b)
    extra.match = ok
    if (flip) ok = !ok
    return assert.ok(ok, message, extra)
  }

  var isObj = assert(a && typeof a === "object", message, extra)
  if (!isObj.ok) {
    // not an object
    if (a == b) isObj.ok = true
    if (flip) isObj.ok = !isObj.ok
    return isObj
  }

  var eq = flip ? inequivalent : equivalent
  return eq(selectFields(a, b), b, message, extra)
}
assert.similar = similar
syns.similar = ["isSimilar"
               ,"has"
               ,"hasFields"
               ,"like"
               ,"isLike"]

function dissimilar (a, b, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  message = message || "should be dissimilar"
  return similar(a, b, message, extra, true)
}
assert.dissimilar = dissimilar
syns.dissimilar = ["unsimilar"
                  ,"notSimilar"
                  ,"unlike"
                  ,"isUnlike"
                  ,"notLike"
                  ,"isNotLike"
                  ,"doesNotHave"
                  ,"isNotSimilar"
                  ,"isDissimilar"]

function type (thing, t, message, extra) {
  if (extra && extra.skip) return assert.skip(message, extra)
  var name = t
  if (typeof name === "function") name = name.name || "(anonymous ctor)"
  //console.error("name=%s", name)
  message = message || "type is "+name
  var type = typeof thing
  //console.error("type=%s", type)
  if (!thing && type === "object") type = "null"
  if (type === "object" && t !== "object") {
    if (typeof t === "function") {
      //console.error("it is a function!")
      extra = extra || {}
      extra.found = Object.getPrototypeOf(thing).constructor.name
      extra.wanted = name
      //console.error(thing instanceof t, name)
      return assert.ok(thing instanceof t, message, extra)
    }

    //console.error("check prototype chain")
    // check against classnames or objects in prototype chain, as well.
    // type(new Error("asdf"), "Error")
    // type(Object.create(foo), foo)
    var p = thing
    while (p = Object.getPrototypeOf(p)) {
      if (p === t || p.constructor && p.constructor.name === t) {
        type = name
        break
      }
    }
  }
  //console.error(type, name, type === name)
  return assert.equal(type, name, message, extra)
}
assert.type = type
syns.type = ["isa"]

// synonyms are helpful.
Object.keys(syns).forEach(function (c) {
  syns[c].forEach(function (s) {
    Object.defineProperty(assert, s, { value: assert[c], enumerable: false })
  })
})

// helpers below

function selectFields (a, b) {
  // get the values in A of the fields in B
  var ret = Array.isArray(b) ? [] : {}
  Object.keys(b).forEach(function (k) {
    if (!a.hasOwnProperty(k)) return
    var v = b[k]
      , av = a[k]
    if (v && av && typeof v === "object" && typeof av === "object"
       && !(v instanceof Date)
       && !(v instanceof RegExp)
       && !(v instanceof String)
       && !(v instanceof Boolean)
       && !(v instanceof Number)
       && !(Array.isArray(v))) {
      ret[k] = selectFields(av, v)
    } else ret[k] = av
  })
  return ret
}

function sortObject (obj) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
    return obj
  }
   
  return Object.keys(obj).sort().reduce(function (acc, key) {
    acc[key] = sortObject(obj[key])
    return acc
  }, {})
}

function stringify (a) {
  return JSON.stringify(sortObject(a), (function () {
    var seen = []
      , keys = []
    return function (key, val) {
      var s = seen.indexOf(val)
      if (s !== -1) {
        return "[Circular: "+keys[s]+"]"
      }
      if (val && typeof val === "object" || typeof val === "function") {
        seen.push(val)
        keys.push(val["!"] || val.name || key || "<root>")
        if (typeof val === "function") {
          return val.toString().split(/\n/)[0]
        } else if (typeof val.toUTCString === "function") {
          return val.toUTCString()
        }
      }
      return val
  }})())
}

function diffString (f, w) {
  if (w === f) return null
  var p = 0
    , l = w.length
  while (p < l && w.charAt(p) === f.charAt(p)) p ++
  w = stringify(w).substr(1).replace(/"$/, "")
  f = stringify(f).substr(1).replace(/"$/, "")
  return diff(f, w, p)
}

function diffObject (f, w) {
  return difflet({ indent : 2, comment : true }).compare(w, f)
}

function diff (f, w, p) {
  if (w === f) return null
  var i = p || 0 // it's going to be at least p. JSON can only be bigger.
    , l = w.length
  while (i < l && w.charAt(i) === f.charAt(i)) i ++
  var pos = Math.max(0, i - 20)
  w = w.substr(pos, 40)
  f = f.substr(pos, 40)
  var pointer = i - pos
  return "FOUND:  "+f+"\n"
       + "WANTED: "+w+"\n"
       + (new Array(pointer + 9).join(" "))
       + "^ (at position = "+p+")"
}

function getCaller (er) {
  // get the first file/line that isn't this file.
  if (!er) er = new Error
  var stack = er.stack || ""
  stack = stack.split(/\n/)
  for (var i = 1, l = stack.length; i < l; i ++) {
    var s = stack[i].match(/\(([^):]+):([0-9]+):([0-9]+)\)$/)
    if (!s) continue
    var file = s[1]
      , line = +s[2]
      , col = +s[3]
    if (file.indexOf(__dirname) === 0) continue
    if (file.match(/tap-test\/test.js$/)) continue
    else break
  }
  var res = {}
  if (file && file !== __filename && !file.match(/tap-test\/test.js$/)) {
    res.file = file
    res.line = line
    res.column = col
  }

  res.stack = stack.slice(1).map(function (s) {
    return s.replace(/^\s*at\s*/, "")
  })

  return res
}


