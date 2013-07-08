/*jshint asi:true */

var test      =  require('tap').test
  , path      =  require('path')
  , fs        =  require('fs')
  , util      =  require('util')
  , Stream    =  require('stream')
  , through   =  require('through')
  , streamapi =  require('../stream-api')
  , readdirp  =  require('..')
  , root       =  path.join(__dirname, 'bed')
  , totalDirs  =  6
  , totalFiles =  12
  , ext1Files  =  4
  , ext2Files  =  3
  , ext3Files  =  2
  ;
  
// see test/readdirp.js for test bed layout

function opts (extend) {
  var o = { root: root };

  if (extend) {
    for (var prop in extend) {
      o[prop] = extend[prop];
    }
  }
  return o;
}

function capture () {
  var result = { entries: [], errors: [], ended: false }
    , dst = new Stream();

  dst.writable = true;
  dst.readable = true;

  dst.write = function (entry) {
    result.entries.push(entry);
  }

  dst.end = function () {
    result.ended = true;
    dst.emit('data', result);
    dst.emit('end');
  }

  return dst;
}

test('\nintegrated', function (t) {
  t.test('\n# reading root without filter', function (t) {
    t.plan(2);
    readdirp(opts())
      .on('error', function (err) {
        t.fail('should not throw error', err);
      })
      .pipe(capture())
      .pipe(through(
        function (result) { 
          t.equals(result.entries.length, totalFiles, 'emits all files');
          t.ok(result.ended, 'ends stream');
          t.end();
        }
      ));
  })

  t.test('\n# normal: ["*.ext1", "*.ext3"]', function (t) {
    t.plan(2);

    readdirp(opts( { fileFilter: [ '*.ext1', '*.ext3' ] } ))
      .on('error', function (err) {
        t.fail('should not throw error', err);
      })
      .pipe(capture())
      .pipe(through(
        function (result) { 
          t.equals(result.entries.length, ext1Files + ext3Files, 'all ext1 and ext3 files');
          t.ok(result.ended, 'ends stream');
          t.end();
        }
      ))
  })

  t.test('\n# negated: ["!*.ext1", "!*.ext3"]', function (t) {
    t.plan(2);

    readdirp(opts( { fileFilter: [ '!*.ext1', '!*.ext3' ] } ))
      .on('error', function (err) {
        t.fail('should not throw error', err);
      })
      .pipe(capture())
      .pipe(through(
        function (result) { 
          t.equals(result.entries.length, totalFiles - ext1Files - ext3Files, 'all but ext1 and ext3 files');
          t.ok(result.ended, 'ends stream');
          t.end();
        }
      ))
  })

  t.test('\n# no options given', function (t) {
    t.plan(1);
    readdirp()
      .on('error', function (err) {
        t.similar(err.toString() , /Need to pass at least one argument/ , 'emits meaningful error');
        t.end();
      })
  })

  t.test('\n# mixed: ["*.ext1", "!*.ext3"]', function (t) {
    t.plan(1);

    readdirp(opts( { fileFilter: [ '*.ext1', '!*.ext3' ] } ))
      .on('error', function (err) {
        t.similar(err.toString() , /Cannot mix negated with non negated glob filters/ , 'emits meaningful error');
        t.end();
      })
  })
})


test('\napi separately', function (t) {

  t.test('\n# handleError', function (t) {
    t.plan(1);

    var api = streamapi()
      , warning = new Error('some file caused problems');

    api.stream
      .on('warn', function (err) {
        t.equals(err, warning, 'warns with the handled error');
      })
    api.handleError(warning);
  })

  t.test('\n# when stream is paused and then resumed', function (t) {
    t.plan(6);
    var api = streamapi()
      , resumed = false
      , fatalError = new Error('fatal!')
      , nonfatalError = new Error('nonfatal!')
      , processedData = 'some data'
      ;

    api.stream
      .on('warn', function (err) {
        t.equals(err, nonfatalError, 'emits the buffered warning');
        t.ok(resumed, 'emits warning only after it was resumed');
      })
      .on('error', function (err) {
        t.equals(err, fatalError, 'emits the buffered fatal error');
        t.ok(resumed, 'emits errors only after it was resumed');
      })
      .on('data', function (data) {
        t.equals(data, processedData, 'emits the buffered data');
        t.ok(resumed, 'emits data only after it was resumed');
      })
      .pause()
    
    api.processEntry(processedData);
    api.handleError(nonfatalError);
    api.handleFatalError(fatalError);
  
    process.nextTick(function () {
      resumed = true;
      api.stream.resume();
    })
  })

  t.test('\n# when a stream is destroyed, it emits "closed", but no longer emits "data", "warn" and "error"', function (t) {
    t.plan(6)
    var api = streamapi()
      , destroyed = false
      , fatalError = new Error('fatal!')
      , nonfatalError = new Error('nonfatal!')
      , processedData = 'some data'

    var stream = api.stream
      .on('warn', function (err) {
        t.notOk(destroyed, 'emits warning until destroyed');
      })
      .on('error', function (err) {
        t.notOk(destroyed, 'emits errors until destroyed');
      })
      .on('data', function (data) {
        t.notOk(destroyed, 'emits data until destroyed');
      })
      .on('close', function () {
        t.ok(destroyed, 'emits close when stream is destroyed');
      })
    

    api.processEntry(processedData);
    api.handleError(nonfatalError);
    api.handleFatalError(fatalError);

    process.nextTick(function () {
      destroyed = true
      stream.destroy()

      t.notOk(stream.readable, 'stream is no longer readable after it is destroyed')

      api.processEntry(processedData);
      api.handleError(nonfatalError);
      api.handleFatalError(fatalError);

      process.nextTick(function () {
        t.pass('emits no more data, warn or error events after it was destroyed')  
      })
    })
  })
})
