# Partials Plugin for DocPad
This plugin provides [DocPad](https://docpad.org) with Partials. Partials are documents which can be inserted into other documents, and are also passed by the docpad rendering engine.


## Install

```
npm install --save docpad-plugin-partials
```


## Usage

### Setup

To use, first create the `src/partials` directory, and place any partials you want to use in there.

Then in our templates we will be exposed with the `@partial(filename,data)` function. The `data` argument is optional, and can be used to send custom data to the partial's template data. If you would like to send over the current document's template data, then do the following `@partial(filename,@,data)`.

If your partial only needs to be rendered once per (re)generation then you can specify `cacheable: true` in the partial's meta data, doing so greatly improves performance.

### Example

For instance we could create the file `src/partials/hello.html.md.eco` which contains `**Hello <%=@name or 'World'%>**`.

We could then render it by using `<%-@partial('hello.html.md.eco')%>` to get back `<strong>Hello World</strong>` or with `<%-@partial('hello.html.md.eco',{name:'Apprentice'})%>` to get back `<strong>Hello Apprentice</strong>`.



## History
You can discover the history inside the `History.md` file


## License
Licensed under the incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://creativecommons.org/licenses/MIT/)
<br/>Copyright &copy; 2012 [Bevry Pty Ltd](http://bevry.me)