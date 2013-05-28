#### Default Template

`docco.jst` and `docco.css` comprise the default Docco template, which
outputs ready-to-go HTML files for you to upload to you webserver.

You can use the default template simply by invoking Docco

    docco src/*.coffee

#### Pagelet Template

`pagelet.jst` and `pagelet.css` output HTML that can be incorporated 
into an existing DOM.

If you are running from the docco directory

    docco src/*.coffee -t resources/pagelet.jst -c resources/pagelet.css

...will generate a custom output of a CSS file that contains only the syntax
highlighting styles, and HTML files describing the sources.

- Each page emits a `<ul class="sections">` element that contains all of the 
sections of generated HTML, for both the docs and highlighted code.
- If there is more than one source input, a `<ul class="file_list">` will be 
emitted, containing information about the source path and html page path for
each source.
