var isPromise = require('is-promise')

var nextTick
if (typeof setImediate === 'function') nextTick = setImediate
else if (typeof process === 'object' && process && process.nextTick) nextTick = process.nextTick
else nextTick = function (cb) { setTimeout(cb, 0) }

var extensions = []

module.exports = Promise
function Promise(fn) {
  if (!(this instanceof Promise)) {
    return fn ? new Promise(fn) : defer()
  }
  if (typeof fn !== 'function') {
    throw new TypeError('fn is not a function')
  }

  var state = {
    isResolved: false,
    isSettled: false,
    isFulfilled: false,
    value: null,
    waiting: [],
    running: false
  }

  function _resolve(val) {
    resolve(state, val);
  }
  function _reject(err) {
    reject(state, err);
  }
  this.then = function _then(onFulfilled, onRejected) {
    return then(state, onFulfilled, onRejected);
  }

  _resolve.fulfill = deprecate(_resolve, 'resolver.fulfill(x)', 'resolve(x)')
  _resolve.reject = deprecate(_reject, 'resolver.reject', 'reject(x)')

  try {
    fn(_resolve, _reject)
  } catch (ex) {
    _reject(ex)
  }
}

function resolve(promiseState, value) {
  if (promiseState.isResolved) return
  if (isPromise(value)) {
    assimilate(promiseState, value)
  } else {
    settle(promiseState, true, value)
  }
}

function reject(promiseState, reason) {
  if (promiseState.isResolved) return
  settle(promiseState, false, reason)
}

function then(promiseState, onFulfilled, onRejected) {
  return new Promise(function (resolve, reject) {
    function done(next, skipTimeout) {
      var callback = promiseState.isFulfilled ? onFulfilled : onRejected
      if (typeof callback === 'function') {
        function timeoutDone() {
          var val
          try {
            val = callback(promiseState.value)
          } catch (ex) {
            reject(ex)
            return next(true)
          }
          resolve(val)
          next(true)
        }
        if (skipTimeout) timeoutDone()
        else nextTick(timeoutDone)
      } else if (promiseState.isFulfilled) {
        resolve(promiseState.value)
        next(skipTimeout)
      } else {
        reject(promiseState.value)
        next(skipTimeout)
      }
    }
    promiseState.waiting.push(done)
    if (promiseState.isSettled && !promiseState.running) processQueue(promiseState)
  })
}

function processQueue(promiseState) {
  function next(skipTimeout) {
    if (promiseState.waiting.length) {
      promiseState.running = true
      promiseState.waiting.shift()(next, skipTimeout)
    } else {
      promiseState.running = false
    }
  }
  next(false)
}

function settle(promiseState, isFulfilled, value) {
  if (promiseState.isSettled) return

  promiseState.isResolved = promiseState.isSettled = true
  promiseState.value = value
  promiseState.isFulfilled = isFulfilled

  processQueue(promiseState)
}

function assimilate(promiseState, thenable) {
  try {
    promiseState.isResolved = true
    thenable.then(function (res) {
      if (isPromise(res)) {
        assimilate(promiseState, res)
      } else {
        settle(promiseState, true, res)
      }
    }, function (err) {
      settle(promiseState, false, err)
    })
  } catch (ex) {
    settle(promiseState, false, ex)
  }
}

Promise.use = function (extension) {
  extensions.push(extension)
}


function deprecate(method, name, alternative) {
  return function () {
    var err = new Error(name + ' is deprecated use ' + alternative)
    if (typeof console !== 'undefined' && console && typeof console.warn === 'function') {
      console.warn(name + ' is deprecated use ' + alternative)
      if (err.stack) console.warn(err.stack)
    } else {
      nextTick(function () {
        throw err
      })
    }
    method.apply(this, arguments)
  }
}
function defer() {
  var err = new Error('promise.defer() is deprecated')
  if (typeof console !== 'undefined' && console && typeof console.warn === 'function') {
    console.warn('promise.defer() is deprecated')
    if (err.stack) console.warn(err.stack)
  } else {
    nextTick(function () {
      throw err
    })
  }
  var resolver
  var promise = new Promise(function (res) { resolver = res })
  return {resolver: resolver, promise: promise}
}