#config-chain

USE THIS MODULE TO LOAD ALL YOUR CONFIGURATIONS

``` js

  //npm install config-chain

  var cc = require('config-chain')
    , opts = require('optimist').argv //ALWAYS USE OPTIMIST FOR COMMAND LINE OPTIONS.
    , env = opts.env || process.env.YOUR_APP_ENV || 'dev' //SET YOUR ENV LIKE THIS.

  // EACH ARG TO CONFIGURATOR IS LOADED INTO CONFIGURATION CHAIN
  // EARLIER ITEMS OVERIDE LATER ITEMS
  // PUTS COMMAND LINE OPTS FIRST, AND DEFAULTS LAST!

  //strings are interpereted as filenames.
  //will be loaded synchronously

  var conf = 
  cc(
    //OVERRIDE SETTINGS WITH COMMAND LINE OPTS
    opts,

    //ENV VARS IF PREFIXED WITH 'myApp_'

    cc.env('myApp'), //myApp_foo = 'like this'

    //FILE NAMED BY ENV
    path.join(__dirname,  'config.' + env + '.json'), 

    //IF `env` is PRODUCTION
    env === 'prod' 
      ? path.join(__dirname, 'special.json') //load a special file
      : null //NULL IS IGNORED!

    //SUBDIR FOR ENV CONFIG
    path.join(__dirname,  'config', env, 'config.json'), 
    
    //SEARCH PARENT DIRECTORIES FROM CURRENT DIR FOR FILE
    cc.find('config.json'),
    
    //PUT DEFAULTS LAST
    { 
      host: 'localhost'
      port: 8000
    })

  var host = conf.get('host')
  
  // or

  var host = conf.store.host

```
FINALLY, EASY FLEXIBLE CONFIGURATIONS!

##see also: (proto-list)[https://github.com/isaacs/proto-list/]


##TODO

  * add support for more types of parser, 
  yaml, ini, whatever I can find in npm.
  * if string is http://... load config from internet. (useful for devops)
