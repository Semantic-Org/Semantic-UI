
# node-fresh

  HTTP response freshness testing

## fresh(req, res)

 Check freshness of `req` and `res` headers.

 When the cache is "fresh" __true__ is returned,
 otherwise __false__ is returned to indicate that
 the cache is now stale.

## Example:

```js
var req = { 'if-none-match': 'tobi' };
var res = { 'etag': 'luna' };
fresh(req, res);
// => false

var req = { 'if-none-match': 'tobi' };
var res = { 'etag': 'tobi' };
fresh(req, res);
// => true
```

## Installation

```
$ npm install fresh
```