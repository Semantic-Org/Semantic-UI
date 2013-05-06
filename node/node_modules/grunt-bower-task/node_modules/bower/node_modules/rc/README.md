# rc

the non configurable configuration loader for lazy people.

# Usage

the only option is to pass rc the name of your app, and your default configuration.

```
  var rc = require('rc')(appname, {
    //defaults go here.
    port: 2468
  })
```

# Standards

Given your application name, rc will look in all the obvious places for configuration.


  * command line arguments (parsed by optimist)
  * enviroment variables prefixed with ${APPNAME}_
  * if you passed an option `--config file` then from that file
  * `$HOME/.${APPNAME}rc`
  * `$HOME/.${APPNAME}/config`
  * `$HOME/.config/${APPNAME}`
  * `$HOME/.config/${APPNAME}/config`
  * `/etc/${APPNAME}rc`
  * `/etc/${APPNAME}/config`
  * the defaults object you passed in.

All configuration sources that where found will be flattened into one object,
so that sources earlier in this list override later ones.

# Formats

Configuration files may be in either `json` or `ini` format.
Since ini, and env variables do not have a standard for types,
your application needs be prepared for strings.

# License

BSD
