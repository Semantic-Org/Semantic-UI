# Text Plugin for DocPad
This plugin allows you to render variables within `templateData` using text elements

E.g. if you have this in your `docpad.cson`

``` coffeescript
{
	templateData:
		firstname: 'Benjamin'
		lastname: 'Lupton'
		fullname: '<t>firstname</t> <t>lastname</t>'
		markdownExample: '<t render="markdown">this is so **awesome**</t>'
		markdownEcoExample: '<t render="md.eco">here is a random number: **<%- Math.random() %>**</t>'
}
```

Doing the following inside a document:

``` html
My creator's firstname is: <t>firstname</t>
My creator's lastname is: <t>lastname</t>
My creator's fullname is: <t>fullname</t>
The markdown example is: <t>markdownExample</t>
The markdown eco example is: <t>markdownEcoExample</t>
```

Will output:

``` html
My creator's firstname is: Benjamin
My creator's lastname is: Lupton
My creator's fullname is: Benjamin Lupton
The markdown example is: this is so <strong>awesome</strong>
The markdown eco example is: here is a random number: <strong>0.5123213213123</strong>
```

Which is incredibly useful for abstracting out common generic pieces of text from your templates and placing them inside your configuration files. A common use case for this is easy configurability of skeletons, as well as easier translation of your website.

If you are embedding a text block into a text block, it is best that you name your text block like so `<t:myName>blah</t:myName>` that way our parser won't get confused as easily :)

To use it with [coffeekup](http://coffeekup.org/) you'll do it like so `tag 'text', {render:"md"}, "your **markdown** content"`. [More info here.](https://github.com/bevry/docpad/issues/194#issuecomment-11363441).

Alternatively, you can use the `t` template helper like so `@t('*markdown*', {render="markdown"})`


## Install
To use this plugin with DocPad, simply run `npm install docpad-plugin-text` inside your website's directory. You'd probably also want to add `"docpad-plugin-text": "latest"` to your `package.json` dependencies.


## History
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012+ [Bevry Pty Ltd](http://bevry.me)