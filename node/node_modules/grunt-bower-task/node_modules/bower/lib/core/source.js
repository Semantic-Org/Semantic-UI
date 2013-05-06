// ==========================================
// BOWER: Source Api
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

var request  = require('request');
var config   = require('./config');

var endpoint = config.endpoint + '/packages';

if (config.proxy) {
  request = request.defaults({ proxy: config.proxy, timeout: 5000 });
}


// allow for searchpath endpoints to be used for search and lookup
var endpoints = [];
endpoints.push(endpoint);
if (config.searchpath) {
  for (var i = 0; i < config.searchpath.length; i += 1) {
    endpoints.push(config.searchpath[i] + '/packages');
  }
}

exports.lookup = function (name, callback) {
  // walk all endpoints to find the first matching component
  var f = function (i) {
    var endpoint = endpoints[i];
    request.get(endpoint + '/' + encodeURIComponent(name), function (err, response, body) {
      if (err || (response.statusCode !== 200 && response.statusCode !== 404)) {
        return callback(err || new Error(name + ' failed to look up for endpoint: ' + endpoint));
      }

      if (response && response.statusCode !== 404) {
        callback(err, body && JSON.parse(body).url);
      } else {
        if (i + 1 < endpoints.length) f(i + 1);
        else return callback(new Error(name + ' not found'));
      }
    });
  };
  f(0);
};

exports.register = function (name, url, callback) {
  var body = {name: name, url: url};

  request.post({url: endpoint, form: body}, function (err, response) {
    if (err) return callback(err);

    if (response.statusCode === 406) {
      return callback(new Error('Duplicate package'));
    }

    if (response.statusCode === 400) {
      return callback(new Error('Incorrect format'));
    }

    if (response.statusCode !== 201) {
      return callback(new Error('Unknown error: ' + response.statusCode));
    }

    callback();
  });
};

exports.search = function (name, callback) {
  // walk all endpoints to produced federated search results
  var f = function (i, map, results) {
    var endpoint = endpoints[i];

    request.get(endpoint + '/search/' + encodeURIComponent(name), function (err, response, body) {
      if (err || (response.statusCode !== 200 && response.statusCode !== 404)) {
        return callback(err || new Error(name + ' failed to look up for endpoint: ' + endpoint));
      }

      if (response && response.statusCode !== 404) {
        var array = body && JSON.parse(body);
        for (var x = 0; x < array.length; x += 1) {
          var pkgName = array[x].name;
          if (!map[pkgName]) {
            map[pkgName] = pkgName;
            results.push({ name: pkgName, url: array[x].url, endpoint: array[x].endpoint });
          }
        }
      }

      if (i + 1 < endpoints.length) f(i + 1, map, results);
      else return callback(null, results);
    });
  };

  f(0, {}, []);
};

exports.info = function (name, callback) {
  exports.lookup(name, function (err, url) {
    if (err) return callback(err);

    var Package = require('./package');
    var pkg     = new Package(name, url);

    pkg.once('error', function (err) {
      pkg.removeAllListeners();
      callback(err);
    });
    pkg.once('resolve', function () {
      pkg.once('versions', function (versions) {
        pkg.removeAllListeners();
        callback(null, { pkg: pkg, versions: versions });
      }).versions();
    }).resolve();
  });
};

exports.all = function (callback) {
  // walk all endpoints to produced federated search results
  var f = function (i, map, results) {
    var endpoint = endpoints[i];

    request.get(endpoint, function (err, response, body) {
      if (err || (response.statusCode !== 200 && response.statusCode !== 404)) {
        return callback(err || new Error('Failed to look up endpoint: ' + endpoint));
      }

      if (response && response.statusCode !== 404) {
        var array = body && JSON.parse(body);
        for (var x = 0; x < array.length; x += 1) {
          var pkgName = array[x].name;
          if (!map[pkgName]) {
            map[pkgName] = pkgName;
            results.push({ name: pkgName, url: array[x].url, endpoint: array[x].endpoint });
          }
        }
      }

      if (i + 1 < endpoints.length) f(i + 1, map, results);
      else return callback(null, results);
    });
  };

  f(0, {}, []);
};
