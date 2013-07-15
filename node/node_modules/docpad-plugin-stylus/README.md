# [Stylus](http://learnboost.github.com/stylus/) Plugin for [DocPad](http://docpad.org)

[![Build Status](https://secure.travis-ci.org/docpad/docpad-plugin-stylus.png?branch=master)](http://travis-ci.org/docpad/docpad-plugin-stylus "Check this project's build status on TravisCI")
[![NPM version](https://badge.fury.io/js/docpad-plugin-stylus.png)](https://npmjs.org/package/docpad-plugin-stylus "View this project on NPM")
[![Flattr donate button](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/au/cgi-bin/webscr?cmd=_flow&SESSION=IHj3DG3oy_N9A9ZDIUnPksOi59v0i-EWDTunfmDrmU38Tuohg_xQTx0xcjq&dispatch=5885d80a13c0db1f8e263663d3faee8d14f86393d55a810282b64afed84968ec "Donate once-off to this project using Paypal")

Adds support for the [Stylus](http://learnboost.github.com/stylus/) CSS pre-processor to [DocPad](https://docpad.org)

Convention:  `.css.styl|stylus`


## Install

```
npm install --save docpad-plugin-stylus
```


## Configure

### Use [nib](http://visionmedia.github.com/nib/)
Nib is a small and powerful library for the Stylus CSS language, providing robust cross-browser CSS3 mixins to make your life as a designer easier. By default nib support is enabled, but it can be disabled by setting the `useNib` option to `false`.

This allows you to include the entire library by using:
```css
@import 'nib'
```

Although, if you prefer to use individual parts like gradient support, you can by using:
```css
@import 'nib/gradients'
```

### Compress
By default we compress the output for all environments except the development environment. Set the `compress` option to either `true` or `false` to change this.


## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/docpad-plugin-stylus/blob/master/History.md#files)


## Contributing
[You can discover the contributing instructions inside the `Contributing.md` file](https://github.com/bevry/docpad-plugin-stylus/blob/master/Contributing.md#files)


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me) <us@bevry.me>
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com) <b@lupton.cc>
