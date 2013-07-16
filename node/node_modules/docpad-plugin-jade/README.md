# [Jade](http://jade-lang.com/) Plugin for [DocPad](http://docpad.org)

[![Build Status](https://secure.travis-ci.org/docpad/docpad-plugin-jade.png?branch=master)](http://travis-ci.org/docpad/docpad-plugin-jade "Check this project's build status on TravisCI")
[![NPM version](https://badge.fury.io/js/docpad-plugin-jade.png)](https://npmjs.org/package/docpad-plugin-jade "View this project on NPM")
[![Flattr donate button](https://raw.github.com/balupton/flattr-buttons/master/badge-89x18.gif)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_SM.gif)](https://www.paypal.com/au/cgi-bin/webscr?cmd=_flow&SESSION=IHj3DG3oy_N9A9ZDIUnPksOi59v0i-EWDTunfmDrmU38Tuohg_xQTx0xcjq&dispatch=5885d80a13c0db1f8e263663d3faee8d14f86393d55a810282b64afed84968ec "Donate once-off to this project using Paypal")

Adds support for the [Jade](http://jade-lang.com/) templating engine to [DocPad](https://docpad.org)

Convention:  `.anything.jade`


## Install

```
npm install --save docpad-plugin-jade
```


## Usage

### Template Helpers as Filters

Use just like any jade template. However, we do add any docpad template helpers you may have as jade filters. There are two ways you can use these filters:

``` jade
-# first way, calls the template helper like: myTemplateHelper("content", {opt1="blah",opt2="blah",opt3=true})
:myTemplateHelper(opt1=blah,opt2=blah,opt3)
    content

-# second way, calls the template helper like: myTemplateHelper(arg1, arg2)
:myTemplateHelper(args)
    arg1
    arg2
```

NOTE: Not all template helpers support being called this way. If it doesn't work, we'd recommend using the text plugin to render eco which includes your template helper call. See following section.


### Rendering with the Text Plugin
You can use the [text plugin](http://docpad.org/plugin/text) to render different parts of your template with different markups that are support by your docpad setup. Once installed, you can do things like:

``` jade
:t(render="markdown")
    here is some *markdown*

:t(render="html.md.eco")
    here is some <%-'eco'.toUpperCase()%> to *markdown* to html

:t(render="html.eco")
    my url is <%-@document.url%>
```


## History
[You can discover the history inside the `History.md` file](https://github.com/bevry/docpad-plugin-jade/blob/master/History.md#files)


## Contributing
[You can discover the contributing instructions inside the `Contributing.md` file](https://github.com/bevry/docpad-plugin-jade/blob/master/Contributing.md#files)


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me) <us@bevry.me>
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com) <b@lupton.cc>
