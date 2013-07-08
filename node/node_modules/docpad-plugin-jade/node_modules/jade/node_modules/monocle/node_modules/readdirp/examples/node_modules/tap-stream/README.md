# tap-stream [![Build Status](https://secure.travis-ci.org/thlorenz/tap-stream.png)](http://travis-ci.org/thlorenz/tap-stream)

Taps a nodejs stream and logs the data that's coming through.

    npm install tap-stream

Given an [object stream](#object-stream) we can print out objects passing through and control the detail via the
depth parameter:

```javascript
objectStream().pipe(tap(0));
```

![depth0](https://github.com/thlorenz/tap-stream/raw/master/assets/depth0.png)

```javascript
objectStream().pipe(tap(1));
```

![depth1](https://github.com/thlorenz/tap-stream/raw/master/assets/depth1.png)

```
objectStream().pipe(tap(2));
```

![depth2](https://github.com/thlorenz/tap-stream/raw/master/assets/depth2.png)

For even more control a custom log function may be supplied:

```javascript
objectStream()
  .pipe(tap(function customLog (data) {
      var nest = data.nest;
      console.log ('Bird: %s, id: %s, age: %s, layed egg: %s', nest.name, data.id, nest.age, nest.egg !== undefined);
    })
  );
```

```text
Bird: yellow rumped warbler, id: 0, age: 1, layed egg: true
Bird: yellow rumped warbler, id: 1, age: 1, layed egg: true
```

## API

### tap( [ depth | log ] )

Intercepts the stream and logs data that is passing through.

- optional parameter is either a `Number` or a `Function`
- if no parameter is given, `depth` defaults to `0` and `log` to `console.log(util.inspect(..))`

- `depth` controls the `depth` with which
  [util.inspect](http://nodejs.org/api/util.html#util_util_inspect_object_showhidden_depth_colors) is called
- `log` replaces the default logging function with a custom one

**Example:**

```javascript
var tap = require('tap-stream');

myStream
  .pipe(tap(1)) // log intermediate results
  .pipe(..)     // continute manipulating the data
```

## Object stream

Included in order to give context for above examples.

```javascript
function objectStream () {
  var s = new Stream()
    , objects = 0;
 
  var iv = setInterval(
      function () {
        s.emit('data', { 
            id: objects
          , created: new Date()
          , nest: { 
                name: 'yellow rumped warbler'
              , age: 1
              , egg: { name: 'unknown' , age: 0 }
              } 
          }
        , 4
        );

        if (++objects === 2) {
            s.emit('end');
            clearInterval(iv);
        }
      }
    , 200);
  return s;
}
```
