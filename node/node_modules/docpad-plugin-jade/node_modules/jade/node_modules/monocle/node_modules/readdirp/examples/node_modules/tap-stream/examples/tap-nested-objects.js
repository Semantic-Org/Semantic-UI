var Stream = require('stream')
  , tap = require('..');

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
        );

        if (++objects === 2) {
            s.emit('end');
            clearInterval(iv);
        }
      }
    , 200);
  return s;
}

objectStream().pipe(tap(2));

objectStream()
  .pipe(tap(function customLog (data) {
      var nest = data.nest;
      console.log ('Bird: %s, id: %s, age: %s, layed egg: %s', nest.name, data.id, nest.age, nest.egg !== undefined);
    })
  );

