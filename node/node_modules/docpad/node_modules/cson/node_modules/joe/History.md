## History

- v1.1.1 October 25, 2012
	- Build improvements
	- Updated [bal-util](https://github.com/balupton/bal-util) from v1.3 to v1.15
	- Updated [coffee-script](https://github.com/jashkenas/coffee-script) devDependency from 1.3 to 1.4

- v1.1.0 October 25, 2012
	- Updated [cli-color](https://github.com/medikoo/cli-color) from v0.1 to v0.2
	- Updated [bal-util](https://github.com/balupton/bal-util) from v1.11 to v1.13
		- Update: turns out I actually specified v1.3 instead of v1.13 - it works, but not desirable, fixed in v1.1.1

- v1.0.3 August 9, 2012
	- Windows support
	- Re-added markdown files to npm distribution as they are required for the npm website

- v1.0.2 July 4, 2012
	- We now error on incomplete tasks
	- Joe now handles (instead of reporters):
		- the counting of total, passed, failed and incomplete suites and tests
		- the logging of errors with their suites sand tests
		- the fetching of suite and test names (including their parents)

- v1.0.1 June 11, 2012
	- Joe will now throw errors if you have an incorrect amount of arguments for your `suite` and `test` callbacks

- v1.0.0 June 11, 2012
	- Finalised and cleaned the API

- v0.4.0 June 9, 2012
	- More cleaning

- v0.3.5 June 9, 2012
	- We include `cli-color` now in dependencies and optionalDependencies so it will install for node 0.4 users
	- We now return the correct exit code

- v0.3.4 June 9, 2012
	- Now handles optional dependencies correctly

- v0.3.3 June 9, 2012
	- Added cli-color as an optional and bundled dependency

- v0.3.2 June 9, 2012
	- [bal-util](https://github.com/balupton/bal-util) is now a bundled dependency

- v0.3.1 June 9, 2012
	- Joe no longer exposes globals, use `joe.describe|suite`, and now `joe.test|it`
	- Global suites now run under the suite `joe.globalSuite`, which allows us to auto-exit

- v0.3.0 June 8, 2012
	- Lots of cleaning
	- Abstracted generic code to bal-util

- v0.2.1 June 4, 2012
	- Bugfixes

- v0.2.0 June 4, 2012
	- Added support for reporters

- v0.1.0 June 4, 2012
	- Initial and working commit