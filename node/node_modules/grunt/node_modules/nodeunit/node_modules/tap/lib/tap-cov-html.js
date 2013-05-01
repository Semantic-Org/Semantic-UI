var fs = require('fs'),
    path = require('path'),
    asyncMap = require("slide").asyncMap,
    util = require('util');

var CovHtml = module.exports = function(cov_stats, cov_dir, cb) {
  var index = [];

  asyncMap(
    Object.keys(cov_stats),
    function(f, cb) {
      var st = cov_stats[f],
          missing_lines = st.missing.map(function(l) {
            return l.number;
          }),
          out = '<!doctype html>\n<html lang="en">\n<head>\n  ' +
                '<meta charset="utf-8">\n  <title>' +

      f + ' (' + st.loc + ')</title>\n' +
      '<style type="text/css">\n' + 
      'li {\n' +
      '  font-family: monospace;\n' +
      '  white-space: pre;\n' +
      '}\n' +
      '</style>\n' +
      '</head>\n<body>\n' +
      '<h1>' + f + ' (' + st.loc + ')' + '</h1>' +
      '<h2>Run: ' + (st.missing.length ? st.loc - st.missing.length : st.loc) + ', Missing: ' +
      st.missing.length + ', Percentage: ' + st.percentage + '</h2>' +
      '<h2>Source:</h2>\n' +
      '<ol>\n' + 
      st.lines.map(function(line) {
        var number = line.number,
            color = (missing_lines.indexOf(number) !== -1) ? '#fcc' : '#cfc';
        return '<li id="L' + line.number + '" style="background-color: ' + color +
               ';">' + line.source.replace(/</g, "&lt;") + '</li>';
      }).join('\n') + 
      '</ol>\n' +
      '<h2>Data</h2>\n'+
      '<pre>' + util.inspect(st, true, Infinity, false).replace(/</g, "&lt;") + '</pre></body>\n</html>';

      fs.writeFile(
        cov_dir + '/' + 
        f.replace(process.cwd() + '/', '').replace(/\//g, '+') + '.html',
        out,
        'utf8',
        function(err) {
          if (err) {
            throw err;
          }
          index.push(f);
          cb();
        });
    },
    function(err) {
      if (err) {
        throw err;
      }
      var out = '<!doctype html>\n<html lang="en">\n<head>\n  ' +
          '<meta charset="utf-8">\n  <title>Coverage Index</title>\n</head>\n' +
          '<body>\n<h1>Code Coverage Information</h1>\n<ul>' +
          index.map(function(fname) {
            return '<li><a href="' +
            fname.replace(process.cwd() + '/', '').replace(/\//g, '+') + '.html' +
            '">' + fname + '</a></li>';
          }).join('\n') + '</ul>\n</body>\n</html>';

      fs.writeFile(cov_dir + '/index.html', out, 'utf8', function(err) {
        if (err) {
          throw err;
        }
        cb();
      });   
    }
  );
};


