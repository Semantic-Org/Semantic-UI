
# is-promise

  Test whether an object looks like a promises-a+ promise

## Installation

  Client:

    $ component install then/is-promise

  Server:

    $ npm install is-promise

## API

```javascript
var isPromise = require('is-promise');

isPromise({then:function () {...}});//=>true
isPromise(null);//=>false
isPromise({});//=>false
isPromise({then: true})//=>false
```

## License

  MIT
