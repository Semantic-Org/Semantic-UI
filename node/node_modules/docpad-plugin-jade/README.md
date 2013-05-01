# Jade Plugin for DocPad
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
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)
<br/>Copyright &copy; 2011 [Benjamin Lupton](http://balupton.com)
