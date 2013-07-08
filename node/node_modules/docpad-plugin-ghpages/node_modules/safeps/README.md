# Safe PS

[![Build Status](https://secure.travis-ci.org/bevry/safeps.png?branch=master)](http://travis-ci.org/bevry/safeps)
[![NPM version](https://badge.fury.io/js/safeps.png)](https://npmjs.org/package/safeps)
[![Flattr this project](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr)

Work with processes safely and easily in Node.js



## Install

1. [Install Node.js](http://bevry.me/node/install)
2. `npm install --save safeps`



## Usage

``` javascript
var safeps = require('safeps');
```

### Processes

- `openProcess(task)` fire a process task, and keep it open until the task's completion callback fires
	- `task(complete)`
- `spawn(command, opts?, next?)` spawn a process, with respect to the maximum amount of processes we can open at once
	- `command` an array of arguments to execute
	- `opts={safe:true, read:true, output:false, stdin:null}` options are also sent on to `require('child_process').spawn`
		- `safe` whether or not we should attempt to get the absolute executable path of the command to execute via `require('safeps').getExecPath`
		- `read` whether or not we should listen to the child process's stdout and stderr streams for use in the completion callback
		- `output` if set to `true` will output the child process's stdout to our process's stdout
		- `stdin` if set will be written to the child process's stdin
	- `next(err, stdout, stderr, code, signal)`
- `spawnMultiple(commands, opts?, next?)` spawn multiple processes, forwards on to `require('safeps').spawn`
	- `commands` an array of commands to execute
	- `opts={concurrency:1}` options are also sent on to `require('safeps').spawn`
		- `concurrency` how many processes should we execute at once?
	- `next(err, results)`
		- `results = [result...]`
			- `result = [err, stdout, stderr, code, signal]`
- `spawnCommand(command, args, opts?, next?)` alias of `require('safeps').spawn` but with the `command` prefixed to the `args`, e.g. `spawnCommand('git', 'status')`
- `spawnCommands(command, multiArgs, opts?, next?` alias of `require('safeps').spawnMultiple` but with the `command` prefixed to the `multiArgs`, e.g. `spawnCommands('git', [['status'],['pull']])`
- `exec(command, opts?, next?)` execute a process, with respect to the maximum amount of processes we can open at once
	- `command` a string to execute
	- `opts={output:false}` options are also sent on to `require('child_process').exec`
		- `output` if set to `true` will set the `stdio` option to `inherit` which will output the child process's stdout and stderr to our own
	- `next(err, stdout, stderr)`
- `execMultiple(commands, opts, next)` execute multiple processes, forwards on to `require('safeps').exec`
	- `commands` is an array of commands to execute
	- `opts={concurrency:1}` options are also sent to `require('safeps').exec`
		- `concurrency` how many processes should we execute at once?
	- `next(err, results)`
		- `results = [result...]`
			- `result = [err, stdout, stderr]`


### Paths

- `determineExecPath(possibleExecPaths, next)` determine an executable path from a list
	- `possibleExecPaths` an array of possible executable paths that we shall evaluate
	- `next(err, execPath)`
- `getEnvironmentPaths()` returns an array of the environment paths for executables
- `getStandardExecPaths(execName?)` return an array of the the environment paths for executables with the cwd prepended
	- `execName` if provided, is added onto each of the paths
- `getExecPath(execName, next)` get the absolute executable path, forwards to `get#{execName}Path` when appropriate
	- `next(err, execPath)`
- `getHomePath(next)` get the user's home path
	- `next(err, homePath)`
- `getTmpPath(next)` get the temporary path
	- `next(err, tmpPath)`
- `getGitPath(next)` get the git path
	- `next(err, gitPath)`
- `getNodePath(next)` get the node path
	- `next(err, nodePath)`
- `getNpmPath(next)` get the npm path
	- `next(err, npmPath)`


### Modules

- `initGitRepo(opts, next?)` get the git path, forwards on to `require('safeps').spawnCommand`
	- `opts={cwd:process.cwd(), url:null, remote:'origin', branch:'master'}` options are also sent on to `require('safeps').spawnCommand`
		- `cwd` the path to initialize the repo to
		- `url` the url to initialize
		- `remote` the remote name to associate the `url` to
		- `branch` the branch name to initialize the repo to
	- `next(err, results)`, `results = [result...]`, `result = [err, stdout, stderr, code, signal]`
- `initOrPullGitRepo(opts, next?)` if the path exists, update it, otherwise initialize it, forwards on to `require('safeps').spawnCommand`
	- `opts={cwd:process.cwd(), url:null, remote:'origin', branch:'master'}` options are also sent on to `require('safeps').spawnCommand`
	- `next(err, method, results)`
		- `method` is either `pull` or `init` depending on the method used
		- `results = [result...]`
			- `result = [err, stdout, stderr, code, signal]`
- `initNodeModules(opts, next?)` initialize node modules, forwards on to `require('safeps').spawn`
	- `opts={cwd:process.cwd(), args:[], force:false}` options are also sent on to `require('safeps').spawnCommand`
		- `cwd` the path to initialize the repo to
		- `args` an array of arguments to add onto the initialize command
		- `force` whether or not to still initialize modules if `node_modules` already exists
	- `next(err, results)`, `results = [result...]`, `result = [err, stdout, stderr, code, signal]`


### Environment

- `requireFresh(path)` require the file without adding it to the cache
- `isWindows()` are we running on windows?
- `getLocaleCode(lang?=process.env.LANG)` get the locale code from a language, e.g. `en_au`
- `getLanguageCode(localeCode?=getLocaleCode())` get the language code from a locale code, e.g. `en`
- `getCountryCode(localeCode?=getLocaleCode())` get the country code from a locale code, e.g. `au`



## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/safeps/blob/master/History.md#files)



## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright © 2013+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright © 2011-2012 [Benjamin Arthur Lupton](http://balupton.com)
