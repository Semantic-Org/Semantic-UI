# Live Reload Plugin for DocPad
Automatically refreshes your [DocPad](https://docpad.org) built website whenever a regeneration is performed



## Install

1. Install the Plugin

  ```
  npm install --save --force docpad-plugin-livereload
  ```

1. Ensure your layout outputs the scripts block, using eco it will look something like this:

  ```
  <%- @getBlock('scripts').toHTML() %>
  ```


## Configure

### `enabled`
By default this plugin is disabled for all environments except the development environment. To enable on more environments set the `enabled` option to `true` inside your environments configuration.

### `browserLog`
By default we will output a log message to the browser console if the browser was just reloaded by livereload. You can turn this off by setting the `browserLog` option to `false`. This feature requires `console.log` and `localStorage` to be available to the browser, if these aren't available then this feature will fail gracefully.

### `regenerateBlock`
By default when a regeneration occurs we will log a message to the browser console (depending on the value of `browserLog`) and reload the browser. You can overwrite this functionality via the `regenerateBlock` option. 

### `inject`
By default we will inject the socket.io dependency if we don't automatically detect it's presence. However, sometimes this auto detection doesn't always work. If this is the case, you can disable the injection and just do the listening by setting the `inject` option to `false`.

### `getSocket`
By default you we create a new socket.io instance for live reload, however if you are doing your own socket.io stuff you will probably want to use your existing instance instead. To do this set the `getSocket` option to a function that will return your own socket.io instance.

### `channel`
By default we use the `/docpad-livereload` channel to listen to on our socket connection. You can change this by using the `channel` option.

### `defaultLogLevel`
By default we use the socket.io log level of `1` (unless docpad is in debug mode in which case we will use the log level of `3`). You can change the default log level used (non-debug-mode) by setting the `defaultLogLevel` option.

### `socketOptions`
Sometimes you may want to customise the options used for the [socket.io configuration](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO). To do this set the `socketOptions` option to whatever you need.


## History
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)