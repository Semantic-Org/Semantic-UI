# Caterpillar

Caterpillar is a simple but powerful intuitive console logger for [Node.js](http://nodejs.org/). It supports grouping of messages, filtering log levels, colors, times, modules, custom formatters and custom transports.


## Example

### Running Normally

Running the [console example](https://github.com/bevry/caterpillar/blob/master/example/console.coffee#files) with `coffee examples/console.coffee`

<img src="https://github.com/bevry/caterpillar/raw/master/media/caterpillar-normal.png"/>


### Running in Debug Mode (log level 7)

Running the [console example](https://github.com/bevry/caterpillar/blob/master/example/console.coffee#files) with `coffee examples/console.coffee -d`

When you set the log level to level 7 (debug level), then the `ConsoleFormatter` will also output a debug line, containing the time, file, function and line number of what triggered the log message

<img src="https://github.com/bevry/caterpillar/raw/master/media/caterpillar-debug.png"/>


## Using

Refer to the [console example](https://github.com/bevry/caterpillar/blob/master/example/console.coffee#files) for usage


## Install

1. [Install Node.js](http://bevry.me/node/install)

1. Install Caterpillar

	```
	npm install caterpillar
	```


## History

You can discover the history inside the [History.md](https://github.com/bevry/caterpillar/blob/master/History.md#files) file


## License

Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)


## Thanks

Uses the following:

- [RFC3164](http://www.faqs.org/rfcs/rfc3164.html) for the level codes and names
- [Mariusz Nowak's](https://github.com/medikoo) [CLI-Color](https://github.com/medikoo/cli-color)

Inspired by the following:

- [Alexander Dorofeev's](https://github.com/akaspin) [AIN](https://github.com/akaspin/ain)
- [TJ Holowaychuk's](https://github.com/visionmedia) [Log.js](https://github.com/visionmedia/log.js)
- [Igor Urminček's](https://github.com/igo) [NLogger](https://github.com/igo/nlogger)
- [SchizoDuckie's](https://github.com/SchizoDuckie) [Node-CLI](https://github.com/SchizoDuckie/Node-CLI/)
