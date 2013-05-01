exports.encode = encode
exports.decode = decode

var seen = []
function encode (obj, indent) {
  var deep = arguments[2]
  if (!indent) indent = "  "

  if (obj instanceof String ||
      Object.prototype.toString.call(obj) === "[object String]") {
    obj = obj.toString()
  }

  if (obj instanceof Number ||
      Object.prototype.toString.call(obj) === "[object Number]") {
    obj = obj.valueOf()
  }

  // take out the easy ones.
  switch (typeof obj) {
    case "string":
      obj = obj.trim()
      if (obj.indexOf("\n") !== -1) {
        return "|\n" + indent + obj.split(/\r?\n/).join("\n"+indent)
      } else {
        return (obj)
      }

    case "number":
      return obj.toString(10)

    case "function":
      return encode(obj.toString(), indent, true)

    case "boolean":
      return obj.toString()

    case "undefined":
      // fallthrough
    case "object":
      // at this point we know it types as an object
      if (!obj) return "~"

      if (obj instanceof Date ||
          Object.prototype.toString.call(obj) === "[object Date]") {
        return JSON.stringify("[Date " + obj.toISOString() + "]")
      }

      if (obj instanceof RegExp ||
          Object.prototype.toString.call(obj) === "[object RegExp]") {
        return JSON.stringify(obj.toString())
      }

      if (obj instanceof Boolean ||
          Object.prototype.toString.call(obj) === "[object Boolean]") {
        return obj.toString()
      }

      if (seen.indexOf(obj) !== -1) {
        return "[Circular]"
      }
      seen.push(obj)

      if (typeof Buffer === "function" &&
          typeof Buffer.isBuffer === "function" &&
          Buffer.isBuffer(obj)) return obj.inspect()

      if (obj instanceof Error) {
        var o = { name: obj.name
                , message: obj.message
                , type: obj.type }

        if (obj.code) o.code = obj.code
        if (obj.errno) o.errno = obj.errno
        if (obj.type) o.type = obj.type
        obj = o
      }

      var out = ""

      if (Array.isArray(obj)) {
        var out = "\n" + indent + "- " +obj.map(function (item) {
          return encode(item, indent + "  ", true)
        }).join("\n"+indent + "- ")
        break
      }

      // an actual object
      var keys = Object.keys(obj)
        , niceKeys = keys.map(function (k) {
            return (k.match(/^[a-zA-Z0-9_]+$/) ? k : JSON.stringify(k)) + ": "
          })
      //console.error(keys, niceKeys, obj)
      var maxLength = Math.max.apply(Math, niceKeys.map(function (k) {
            return k.length
          }).concat(0))
      //console.error(niceKeys, maxLength)

      var spaces = new Array(maxLength + 1).join(" ")

      if (!deep) indent += "  "
      out = "\n" + indent + keys.map(function (k, i) {
        var niceKey = niceKeys[i]
        return niceKey + spaces.substr(niceKey.length)
                       + encode(obj[k], indent + "  ", true)
      }).join("\n" + indent)
      break

    default: return ""
  }
  if (!deep) seen.length = 0
  return out
}

function decode (str) {
  var v = str.trim()
    , d
    , dateRe = /^\[Date ([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(?::[0-9]{2})?(?:\.[0-9]{3})?(?:[A-Z]+)?)\]$/

  if (v === "~") return null

  try {
    var jp = JSON.parse(str)
  } catch (e) {
    var jp = ""
  }

  if (jp &&
      typeof jp === "string" &&
      (d = jp.match(dateRe)) &&
      (d = Date.parse(d[1]))) {
    return new Date(d)
  }

  if (typeof jp === "boolean") return jp
  if (v && !isNaN(v)) return parseInt(v, 10)

  // something interesting.
  var lines = str.split(/\r?\n/)
  // check if it's some kind of string or something.
  // if the first line is > or | then it's a wrapping indented string.
  // if the first line is blank, and there are many lines,
  // then it's an array or object.
  // otherwise, it's just ""
  var first = lines.shift().trim()
  if (lines.length) lines = undent(lines)
  switch (first) {
    case "|":
      return lines.join("\n")
    case ">":
      return lines.join("\n").split(/\n{2,}/).map(function (l) {
        return l.split(/\n/).join(" ")
      }).join("\n")
    default:
      if (!lines.length) return first
      // array or object.
      // the first line will be either "- value" or "key: value"
      return lines[0].charAt(0) === "-" ? decodeArr(lines) : decodeObj(lines)
  }
}

function decodeArr (lines) {
  var out = []
    , key = 0
    , val = []
  for (var i = 0, l = lines.length; i < l; i ++) {
    // if it starts with a -, then it's a new thing
    var line = lines[i]
    if (line.charAt(0) === "-") {
      if (val.length) {
        out[key ++] = decode(val.join("\n"))
        val.length = 0
      }
      val.push(line.substr(1).trim())
    } else if (line.charAt(0) === " ") {
      val.push(line)
    } else return []
  }
  if (val.length) {
    out[key ++] = decode(val.join("\n"))
  }
  return out
}

function decodeObj (lines) {
  var out = {}
    , val = []
    , key = null

  for (var i = 0, l = lines.length; i < l; i ++) {
    var line = lines[i]
    if (line.charAt(0) === " ") {
      val.push(line)
      continue
    }
    // some key:val
    if (val.length) {
      out[key] = decode(val.join("\n"))
      val.length = 0
    }
    // parse out the quoted key
    var first
    if (line.charAt(0) === "\"") {
      for (var ii = 1, ll = line.length, esc = false; ii < ll; ii ++) {
        var c = line.charAt(ii)
        if (c === "\\") {
          esc = !esc
        } else if (c === "\"" && !esc) {
          break
        }
      }
      key = JSON.parse(line.substr(0, ii + 1))
      line = line.substr(ii + 1)
      first = line.substr(line.indexOf(":") + 1).trim()
    } else {
      var kv = line.split(":")
      key = kv.shift()
      first = kv.join(":").trim()
    }
    // now we've set a key, and "first" has the first line of the value.
    val.push(first.trim())
  }
  if (val.length) out[key] = decode(val.join("\n"))
  return out
}

function undent (lines) {
  var i = lines[0].match(/^\s*/)[0].length
  return lines.map(function (line) {
    return line.substr(i)
  })
}


// XXX Turn this into proper tests.
if (require.main === module) {
var obj = [{"bigstring":new Error().stack}
          ,{ar:[{list:"of"},{some:"objects"}]}
          ,{date:new Date()}
          ,{"super huge string":new Error().stack}
          ]

Date.prototype.toJSON = function (k, val) {
  console.error(k, val, this)
  return this.toISOString() + " (it's a date)"
}

var enc = encode(obj)
  , dec = decode(enc)
  , encDec = encode(dec)

console.error(JSON.stringify({ obj : obj
                             , enc : enc.split(/\n/)
                             , dec : dec }, null, 2), encDec === enc)

var num = 100
  , encNum = encode(num)
  , decEncNum = decode(encNum)
console.error([num, encNum, decEncNum])
}
