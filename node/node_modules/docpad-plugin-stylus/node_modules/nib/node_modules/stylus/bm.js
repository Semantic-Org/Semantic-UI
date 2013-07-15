
/**
 * Module dependencies.
 */

var stylus = require('./')
  , fs = require('fs');

var times = ~~process.env.TIMES || 1
  , avgs = [];

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.styl');
}).map(function(file){
  return file.replace('.styl', '');
});

console.log();
cases.forEach(function(test){
  var name = test.replace(/[-.]/g, ' ');
  var path = 'test/cases/' + test + '.styl';
  var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '');

  var style = stylus(styl)
    .set('filename', path)
    .include(__dirname + '/test/images')
    .include(__dirname + '/test/cases/import.basic')
    .define('url', stylus.url());

  if (~test.indexOf('compress')) style.set('compress', true);

  var runs = []
    , n = times
    , start;

  while (n--) {
    start = new Date;
    style.render(function(err){
      if (err) throw err;
    });
    runs.push(new Date - start);
  }

  var avg = runs.reduce(function(sum, n){
    return sum + n;
  }) / times;

  avgs.push(avg);

  // im cool like that
  var avgavg = avgs.reduce(function(sum, n){
    return sum + n;
  }) / avgs.length;

  if (avg > avgavg) {
    console.log('  \033[31m%s \033[31m%dms \033[90m+%dms\033[0m', name, avg | 0, avg - avgavg | 0);
  } else {
    console.log('  \033[36m%s \033[90m%dms\033[0m', name, avg | 0);
  }
});
console.log();