## History

- v1.15.4 January 8, 2013
	- `balUtilPaths` changes:
		- Renamed `testIgnorePatterns` to `isIgnoredPath`
			- Added aliases for b/c compatibility
		- Added new `ignorePaths` option

- v1.15.3 December 24, 2012
	- `balUtilModules` changes:
		- Added `requireFresh`

- v1.15.2 December 16, 2012
	- `balUtilPaths` changes:
		- Fixed `scandir` not inheriting ignore patterns when recursing

- v1.15.1 December 15, 2012
	- `balUtilPaths` changes:
		- Fixed `testIgnorePatterns` when `ignoreCommonPatterns` is set to `true`

- v1.15.0 December 15, 2012
	- `balUtilPaths` changes:
		- Added `testIgnorePatterns`
		- Renamed `ignorePatterns` to `ignoreCommonPatterns`, and added new `ignoreCustomPatterns`
			- Affects `scandir` options
		- Added emac cache files to `ignoreCommonPatterns`

- v1.14.1 December 14, 2012
	- `balUtilModules` changes:
		- Added `getExecPath` that will fetch an executable path based on the paths within the environment `PATH` variable
	- Rebuilt with CoffeeScript 1.4.x

- v1.14.0 November 23, 2012
	- `balUtilPaths` changes:
		- `readPath` will now follow url redirects

- v1.13.13 October 26, 2012
	- `balUtilPaths` changes:
		- Files that start with `~` are now correctly ignored in `commonIgnorePatterns`

- v1.13.12 October 22, 2012
	- `balUtilFlow` changes:
		- `extend` is now an alias of `shallowExtendPlainObjects` as they were exactly the same
	- `balUtilHTML` changes:
		- `replaceElement` and `replaceElementAsync` changes:
			- now accept arguments in object form as well
			- accept a `removeIndentation` argument that defaults to `true`

- v1.13.11 October 22, 2012
	- `balUtilPaths` changes:
		- `ensurePath` now returns `err` and `exists` instead of just `err`
	- `balUtilModules` changes:
		- `initGitRepo` will now default `remote` to `origin` and `branch` to `master`
		- Added `initOrPullGitRepo`

- v1.13.10 October 7, 2012
	- `balUtilPaths` changes:
		- Added `shallowExtendPlainObjects`

- v1.13.9 October 7, 2012
	- `balUtilPaths` changes:
		- VIM swap files now added to `commonIgnorePatterns`
			- Thanks to [Sean Fridman](https://github.com/sfrdmn) for [pull request #4](https://github.com/balupton/bal-util/pull/4)

- v1.13.8 October 2, 2012
	- `balUtilModules` changes:
		- Added `openProcess` and `closeProcess`, and using them in `spawn` and `exec`, used to prevent `EMFILE` errors when there are too many open processes
		- Max number of open processes is configurable via the `NODE_MAX_OPEN_PROCESSES` environment variable
	` balUtilPaths` changes:
		- Max number of open files is now configurable via the`NODE_MAX_OPEN_FILES` environment variable

- v1.13.7 September 24, 2012
	- `balUtilPaths` changes:
		- Added `textExtensions` and `binaryExtensions`
			- The environment variables `TEXT_EXTENSIONS` and `BINARY_EXTENSIONS` will append to these arrays
		- Added `isText` and `isTextSync`

- v1.13.6 September 18, 2012
	- `balUtilPaths` changes:
		- Improved `getEncoding`/`getEncodingSync` detection
			- Will now scan start, middle and end, instead of just middle

- v1.13.5 September 13, 2012
	- `balUtilPaths` changes:
		- Added `getEncoding` and `getEncodingSync`

- v1.13.4 August 28, 2012
	- `balUtilModules` changes:
		- Failing to retrieve the path on `getGitPath`, `getNodePath` and `getNpmPath` will now result in an error

- v1.13.3 August 28, 2012
	- `balUtilModules` changes:
		- Fixed `exec` and `execMultiple`
		- Added `gitCommands`, `nodeCommands` and `npmCommands`
	- Dropped node v0.4 support, min required version now 0.6

- v1.13.2 August 16, 2012
	- Repackaged

- v1.13.1 August 16, 2012
	- `balUtilHTML` changes:
		- Fixed `replaceElement` from mixing up elements that start with our desired selector, instead of being only our desired selector

- v1.13.0 August 3, 2012
	- `balUtilModules` changes:
		- Added `determineExecPath`, `getNpmPath`, `getTmpPath`, `nodeCommand` and `gitCommand`
		- `initNodeModules` and `initGitRepo` will now get the determined path of the executable if a path isn't passed
	- Re-added markdown files to npm distribution as they are required for the npm website

- v1.12.5 July 18, 2012
	- `balUtilTypes` changes:
		- Better checks for `isString` and `isNumber` under some environments
	- `balUtilFlow` changes:
		- Removed ambigious `clone` function, use `dereference` or `extend` or `deepExtendPlainObjects` instead

- v1.12.4 July 12, 2012
	- `balUtilTypes` changes:
		- `isObject` now also checks truthyness to avoid `null` and `undefined` from being objects
		- `isPlainObject` got so good, it can't get better
	- `balUtilFlow` changes:
		- added `deepExtendPlainObjects`

- v1.12.3 July 12, 2012
	- `balUtilModules` changes:
		- `npmCommand` will now only prefix with the nodePath if the npmPath exists
		- `npmCommand` and `initNodeModules` now use async fs calls instead of sync calls

- v1.12.2 July 12, 2012
	- `balUtilFlow` changes:
		- Added `dereference`

- v1.12.1 July 10, 2012
	- `balUtilModules` changes:
		- Added `stdin` option to `spawn`

- v1.12.0 July 7, 2012
	- Rejigged `balUtilTypes` and now top level
		- Other components now make use of this instead of inline `typeof` and `instanceof` checks
	- `balUtilFlow` changes:
		- `isArray` and `toString` moved to `balUtilTypes`

- v1.11.2 July 7, 2012
	- `balUtilFlow` changes:
		- Added `clone`
	- `balUtilModules` changes:
		- Fixed exists warning on `initNodeModules`
	- `balUtilPaths` changes:
		- Added `scanlist`
		- `scandir` changes:
			- If `readFiles` is `true`, then we will return the contents into the list entries as well as the tree entries (we weren't doing this for lists before)

- v1.11.1 July 4, 2012
	- `balUtilFlow` changes:
		- `Group` changes:
			- Cleaned up the context handling code
		- `Block` changes:
			- Block constructor as well as `createSubBlock` arguments is now a single `opts` object, acceping the options `name`, `fn`, `parentBlock` and the new `complete`
			- Fixed bug introduced in v1.11.0 causing blocks to complete instantly (instead of once their tasks are finished)

- v1.11.0 July 1, 2012
	- Added `balUtilHTML`:
		- `getAttribute(attributes,attribute)`
		- `detectIndentation(source)`
		- `removeIndentation(source)`
		- `replaceElement(source, elementNameMatcher, replaceElementCallback)`
		- `replaceElementAsync(source, elementNameMatcher, replaceElementCallback, next)`
	- `balUtilFlow` changes:
		- `wait(delay,fn)` introduced as an alternative to `setTimeout`
		- `Group` changes:
			- `push` and `pushAndRun` signatures are now `([context], task)`
				- `context` is optional, and what we should bind to this
				- it saves us having to often wrap our task pushing into for each scopes
			- task completion callbacks are now optional, if not specified a task will be completed as soon as it finishes executing
	- `balUtilEvents`, `balUtilModules` changes:
		- Now make use of the `balUtilFlow.push|pushAndRun` new `context` argument to simplify some loops

- v1.10.3 June 26, 2012
	- `balUtilModules` changes:
		- `initNodeModules` will now install modules from cache, unless `force` is true

- v1.10.2 June 26, 2012
	- `balUtilModules` changes:
		- `initNodeModules` will now never install modules from cache

- v1.10.1 June 26, 2012
	- `balUtilModules` changes:
		- Fixed `npmCommand` under some situations

- v1.10.0 June 26, 2012
	- `balUtilModules` changes:
		- Added `spawnMultiple`, `execMultiple`, `gitGitPath`, `getNodePath`, and `npmCommand`
		- `spawn` and `exec` are now only for single commands, use the new `spawnMultiple` and `execMultiple` for multiple commands instead
		- error exit code is now anything that isnt `0`

- v1.9.4 June 22, 2012
	- Fixed a problem with large asynchronous groups

- v1.9.3 June 22, 2012
	- `balUtilFlow` changes:
		- Added `extractOptsAndCallback` and `extend`

- v1.9.2 June 21, 2012
	- `balUtilFlow` changes:
		- Added `fireWithOptionalCallback`, updated groups and emitters to use this

- v1.9.1 June 21, 2012
	- `balUtilModules` changes:
		- `initNodeModules` now supports `output` option

- v1.9.0 June 21, 2012
	- `balUtilEvents` changes:
		- `EventEmitterEnhanced` changes:
			- `emitSync` and `emitAsync` changes:
				- The next callback is now optional, if it is not detected then we will automatically mark the listener as completed once we have executed it (in other words, if it doesn't have a next callback, then we treat it as a synchronous listener)

- v1.8.8 June 19, 2012
	- Fixed a problem with large synchronous groups

- v1.8.7 June 19, 2012
	- Defaulted `dependencies` to an empty object, to hopefully fix [npm issue #2540](https://github.com/isaacs/npm/pull/2540)

- v1.8.6 June 19, 2012
	- `balUtilEvents` changes:
		- Split `emitSync` and `emitAsync` out of `EventSystem` and into new `EventEmitterEnhanced` that `EventSystem` extends

- v1.8.5 June 11, 2012
	- Made next callbacks necessary by default

- v1.8.4 June 11, 2012
	- `balUtilModule` changes:
		- `spawn`
			- will now return results in the order of `err`, `stdout`, `stderr`, `code`, `signal`
			- now splits string commands using `/ /`
	- `balUtilFlow` changes:
		- `Group` will now only return error as an array if we have more than one error
	- Updated for Joe v1.0.0

- v1.8.3 June 9, 2012
	- `balUtilCompare` changes:
		- `packageCompare` will now fail gracefully if it receives malformed json

- v1.8.2 June 9, 2012
	- Removed request dependency, we now use the native http/https modules

- v1.8.1 June 9, 2012
	- Restructured directories
	- Removed generated docs, use the wiki instead
	- Moved tests from Mocha to [Joe](https://github.com/bevry/joe)
	- Travis now tests against node v0.7
	- `balUtilPaths` changes:
		- Added `exists` and `existsSync` to normalize node's 0.6 to 0.8 api differences
	- Made [request](https://github.com/mikeal/request) an optional dependency

- v1.8.0 June 9, 2012
	- Added expiremental `balUtilFlow.Block`
	- Possibly some undocumented `balUtilFlow.Group` changes

- v1.7.0 June 4, 2012
	- `balUtilFlow` changes:
		- `Group` changes:
			- Constructor now supports `next` and `mode` arguments in any order
			- `clear()` now clears everything
			- Added `hasTasks()`
			- Group completion callback's first argument (the error argument) is now an array of errors (or null if no errors)
			- Added `breakOnError` option (defaults to `true`)
			- Added `autoClear` option to clear once all tasks have run (defualts to `false`)

- v1.6.5 May 30, 2012
	- `balUtilFlow` changes:
		- `Group` changes:
			- Reverted the change made in v1.6.4 where errors in callbacks still increment the complete count
				- Instead, you should be using the `hasExited()` instead of `hasCompleted()` which is used to find out if everything passed successfully

- v1.6.4 May 30, 2012
	- `balUtilFlow` changes:
		- Added `flow({object,action,[args],[tasks],next})` to simplify calling a series of functions of an object
		- `Group` changes:
			- If complete callback is called with an error, it'll still increment the complete count (it didn't before)
			- Added `hasExited()`
	- `balUtilPaths` changes:
		- `writeFile` will now call `ensurePath` before writing the file

- v1.6.3 May 22, 2012
	- `balUtilPaths` changes:
		- Fixed a problem introduced with v1.6.0 with `isDirectory` not opening the file before closing it
		- If the number of open files becomes a negative number, we will now throw an error
		- Decreased the max amount of allowed open files from `500` to `100`
		- Increased the wait time for opening a file from `50` to `100`
			- This is now customisable through the global `waitingToOpenFileDelay`

- v1.6.2 May 13, 2012
	- Added support for `balUtilFlow` and `balUtilTypes` to be used inside web browsers

- v1.6.1 May 4, 2012
	- `balUtilPaths` changes:
		- Fixed `initNodeModules`

- v1.6.0 May 4, 2012
	- We now pre-compile our coffee-script
	- `balUtilPaths` changes:
		- Added `readFile`, `writeFile`, `mkdir`, `stat`, `readdir`, `unlink`, `rmdir`
		- Renamed `rmdir` to `rmdirDeep`
	- `balUtilModules` changes:
		- Removed `initGitSubmodules`, `gitPull`
		- Added `initGitRepo`
		- Rewrote `initNodeModules`

- v1.5.0 April 18, 2012
	- `balUtilPaths` changes:
		- `scan` was removed, not sure what it was used for
		- `isDirectory` now returns the `fileStat` argument to the callback
		- `scandir` changes:
			- `ignorePatterns` option when set to true now uses the new `balUtilPaths.commonIgnorePatterns` property
			- fixed error throwing when passed an invalid path
			- now supports a new `stat` option
			- will return the `fileStat` argument to the `fileAction` and `dirAction` callbacks
			- `ignorePatterns` and `ignoreHiddenFiles` will now correctly be passed to child scandir calls
		- `cpdir` and `rpdir` now uses `path.join` and support `ignoreHiddenFiles` and `ignorePatterns`
		- `writetree` now uses `path.join`

- v1.4.3 April 14, 2012
	- CoffeeScript dependency is now bundled
	- Fixed incorrect octal `0700` should have been `700`

- v1.4.2 April 5, 2012
	- Fixed a failing test due to the `bal-util.npm` to `bal-util` rename
	- Improvements to `balUtilModules.spawn`
		- will only return an error if the exit code was `1`
		- will also contain the `code` and `signal` with the results
		- `results[x][0]` is now the stderr string, rather than an error object

- v1.4.1 April 5, 2012
	- Added `spawn` to `balUtilModules`
	- Added `ignoreHiddenFiles` option to `balUtilPaths.scandir`

- v1.4.0 April 2, 2012
	- Renamed `balUtilGroups` to `balUtilFlow`
	- Added `toString`, `isArray` and `each` to `balUtilFlow`
	- Added `rpdir`, `empty`, and `isPathOlderThan` to `balUtilPaths`

- v1.3.0 February 26, 2012
	- Added `openFile` and `closeFile` to open and close files safely (always stays below the maximum number of allowed open files)
	- Updated all path utilities to use `openFile` and `closeFile`
	- Added npm scripts

- v1.2.0 February 14, 2012
	- Removed single and multi modes from `exec`, now always returns the same consistent `callback(err,results)` instead

- v1.1.0 February 6, 2012
	- Modularized
	- Added [docco](http://jashkenas.github.com/docco/) docs

- v1.0 February 5, 2012
	- Moved unit tests to [Mocha](http://visionmedia.github.com/mocha/)
		- Offers more flexible unit testing
		- Offers better guarantees that tests actually ran, and that they actually ran correctly
	- Added `readPath` and `scantree`
	- Added `readFiles` option to `scandir`
	- `scandir` now supports arguments in object format
	- Removed `parallel`
	- Tasks inside groups now are passed `next` as there only argument
	- Removed `resolvePath`, `expandPath` and `expandPaths`, they were essentially the same as `path.resolve`
	- Most functions will now chain
	- `comparePackage` now supports comparing two local, or two remote packages
	- Added `gitPull`

- v0.9 January 18, 2012
	- Added `exec`, `initNodeModules`, `initGitSubmodules`, `EventSystem.when`
	- Added support for no callbacks

- v0.8 November 2, 2011
	- Considerable improvements to `scandir`, `cpdir` and `rmdir`
		- Note, passing `false` as the file or dir actions will now skip all of that type. Pass `null` if you do not want that.
		- `dirAction` is now fired before we read the directories children, if you want it to fire after then in the next callback, pass a callback in the 3rd argument. See `rmdir` for an example of this.
	- Fixed npm web to url warnings

- v0.7 October 3, 2011
	- Added `versionCompare` and `packageCompare` functions
		- Added `request` dependency

- v0.6 September 14, 2011
	- Updated `util.Group` to support `async` and `sync` grouping

- v0.4 June 2, 2011
	- Added util.type for testing the type of a variable
	- Added util.expandPath and util.expandPaths

- v0.3 June 1, 2011
	- Added util.Group class for your async needs :)

- v0.2 May 20, 2011
	- Added some tests with expresso
	- util.scandir now returns err,list,tree
	- Added util.writetree

- v0.1 May 18, 2011
	- Initial commit
