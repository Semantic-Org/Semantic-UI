
/*!
 * Connect - timeout
 * Ported from https://github.com/LearnBoost/connect-timeout
 * MIT Licensed
 */

/**
 * Timeout:
 *
 * Times out the request in `ms`, defaulting to `5000`. The
 * method `req.clearTimeout()` is added to revert this behaviour
 * programmatically within your application's middleware, routes, etc.
 *
 * @param {Number} ms
 * @return {Function}
 * @api public
 */

module.exports = function timeout(ms) {
  ms = ms || 5000;

  return function(req, res, next) {
    var id = setTimeout(function(){
      req.emit('timeout', ms);
    }, ms);

    req.on('timeout', function(){
      if (req.headerSent) return;
      var err = new Error('Request timeout');
      res.statusCode = 408;
      res.end('Request timeout');
    });

    req.clearTimeout = function(){
      clearTimeout(id);
    };

    res.on('header', function(){
      clearTimeout(id);
    });

    next();
  };
};