# update-notifier [![Build Status](https://secure.travis-ci.org/yeoman/update-notifier.png?branch=master)](http://travis-ci.org/yeoman/update-notifier)

##### Update notifier for your Node.js NPM package

![screenshot](https://raw.github.com/yeoman/update-notifier/master/screenshot.png)

Inform your package users of updates in a non-intrusive way. Mainly targets global CLI apps.

Whenever you initiate the update notifier and it's not within the interval threshold, it will asynchronously check with NPM in the background for available updates, then persist the result. The next time the notifier is initiated the result will be loaded into the `.update` property. This prevents any impact on your package startup performance.
The check process is done with [fork](http://nodejs.org/api/child_process.html#child_process_child_fork). This means that if you call `process.exit`, the check will still be performed in its own process.


## About

The idea for this module came from the desire to apply the browser update strategy to CLI tools, where everyone is always on the latest version. We first tried automatic updating, which we discovered wasn't popular. This is the second iteration of that idea, but limited to just update notifications.

There are a few projects using it:

- [Yeoman](http://yeoman.io) - modern workflows for modern webapps

- [Automaton](https://github.com/IndigoUnited/automaton) - task automation tool

- [Spoon.js CLI](https://npmjs.org/package/spoonjs)


## Example usage

```js
var updateNotifier = require('update-notifier');

// Checks for available update and returns an instance
var notifier = updateNotifier();

if (notifier.update) {
	// Notify using the built-in convenience method
	notifier.notify();
}

// `notifier.update` contains some useful info about the update
console.log(notifier.update);
/*
{
	latest: '0.9.5',
	current: '0.9.3',
	type: 'patch', // possible values: latest, major, minor, patch
	date: '2012-11-05T14:32:37.603Z',
	name: 'yeoman'
}
*/
```

## Example with settings and custom message

```js
var notifier = updateNotifier({
	updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
});

if (notifier.update) {
	notifier.notify('Update available: ' + notifier.update.latest);
}
```


## Documentation


### updateNotifier([settings])

Checks if there is an available update. Accepts settings defined below. Returns an object with update info if there is an available update, otherwise `undefined`.

### updateNotifier.notify([message || defer])

A convenience method that will inform the user about an available update (see screenshot). By default it will display the message right away. However, if you supply a custom message or `true` it will be displayed right before the process exits.


### Settings


#### packagePath

Type: `string`  
Default: `'package.json'`

Relative path to your module `package.json`.


#### packageName

Type: `string`  
Default: Inferred from `packageFile`

Used instead of inferring it from `packageFile`.  
Requires you to also specify `packageVersion`.


#### packageVersion

Type: `string`  
Default: Inferred from `packageFile`

Used instead of inferring it from `packageFile`.  
Requires you to also specify `packageName`.


#### updateCheckInterval

Type: `number`  
Default: `1000 * 60 * 60 * 24` (1 day)

How often it should check for updates.


#### updateCheckTimeout

Type: `number`  
Default: `20000` (20 secs)

How long the update can take.  
If it takes longer than the timeout, it will be aborted.

#### registryVersion

Type: `string`  
Default: `'http://registry.npmjs.org/%s'`

Alternative registry mirrors:

- `http://85.10.209.91/%s`
- `http://165.225.128.50:8000/%s`


### User settings

Users of your module have the ability to opt-out of the update notifier by changing the `optOut` property to `true` in `~/.config/configstore/update-notifier-[your-module-name].yml`. The path is available in `notifier.config.path`.

You could also let the user opt-out on a per run basis:

```js
if (process.argv.indexOf('--no-update-notifier') === -1) {
	// run updateNotifier()
}
```


## License

[BSD license](http://opensource.org/licenses/bsd-license.php) and copyright Google
