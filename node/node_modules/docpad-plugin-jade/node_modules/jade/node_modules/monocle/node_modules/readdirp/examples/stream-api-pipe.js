var readdirp =  require('..')
  , path = require('path')
  , es = require('event-stream');

// print out all JavaScript files along with their size
readdirp({ root: path.join(__dirname), fileFilter: '*.js' })
  .on('warn', function (err) { console.error('non-fatal error', err); })
  .on('error', function (err) { console.error('fatal error', err); })
  .pipe(es.mapSync(function (entry) { 
    return { path: entry.path, size: entry.stat.size };
  }))
  .pipe(es.stringify())
  .pipe(process.stdout);
