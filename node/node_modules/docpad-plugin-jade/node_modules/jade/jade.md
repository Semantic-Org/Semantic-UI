
# Jade

  The jade template engine for node.js

## Synopsis

    jade [-h|--help] [-v|--version] [-o|--obj STR]
         [-O|--out DIR] [-p|--path PATH] [-P|--pretty]
         [-c|--client] [-D|--no-debug]

## Examples

  translate jade the templates dir

    $ jade templates

  create {foo,bar}.html

    $ jade {foo,bar}.jade

  jade over stdio

    $ jade < my.jade > my.html

  jade over s

    $ echo "h1 Jade!" | jade

  foo, bar dirs rendering to /tmp

    $ jade foo bar --out /tmp

  compile client-side templates without debugging
  instrumentation, making the output javascript
  very light-weight. This requires runtime.js
  in your projects.

     $ jade --client --no-debug < my.jade

## Tags

  Tags are simply nested via whitespace, closing
  tags defined for you. These indents are called "blocks".
  
    ul
      li
        a Foo
      li
        a Bar

  You may have several tags in one "block":
  
    ul
      li
        a Foo
        a Bar
        a Baz

## Self-closing Tags

  Some tags are flagged as self-closing by default, such
  as `meta`, `link`, and so on. To explicitly self-close
  a tag simply append the `/` character:

     foo/
     foo(bar='baz')/

  Would yield:
  
     <foo/>
     <foo bar="baz"/>

## Attributes

  Tag attributes look similar to HTML, however
  the values are regular JavaScript, here are
  some examples:
  
    a(href='google.com') Google
    a(class='button', href='google.com') Google

  As mentioned the attribute values are just JavaScript,
  this means ternary operations and other JavaScript expressions
  work just fine:
  
    body(class=user.authenticated ? 'authenticated' : 'anonymous')
    a(href=user.website || 'http://google.com')

  Multiple lines work too:

    input(type='checkbox',
      name='agreement',
      checked)

  Multiple lines without the comma work fine:

    input(type='checkbox'
      name='agreement'
      checked)

  Funky whitespace? fine:

    input(
      type='checkbox'
      name='agreement'
      checked)

## Boolean attributes

  Boolean attributes are mirrored by Jade, and accept
  bools, aka _true_ or _false_. When no value is specified
  _true_ is assumed. For example:
  
    input(type="checkbox", checked)
    // => "<input type="checkbox" checked="checked" />"

  For example if the checkbox was for an agreement, perhaps `user.agreed`
  was _true_ the following would also output 'checked="checked"':
  
     input(type="checkbox", checked=user.agreed)

## Class attributes

  The _class_ attribute accepts an array of classes,
  this can be handy when generated from a javascript
  function etc:
  
    classes = ['foo', 'bar', 'baz']
    a(class=classes)
    // => "<a class="foo bar baz"></a>"

## Class literal

  Classes may be defined using a ".CLASSNAME" syntax:
  
     .button
     // => "<div class="button"></div>"
  
  Or chained:
  
     .large.button
     // => "<div class="large button"></div>"

  The previous defaulted to divs, however you
  may also specify the tag type:
  
      h1.title My Title
      // => "<h1 class="title">My Title</h1>"

## Id literal

  Much like the class literal there's an id literal:
  
    #user-1
    // => "<div id="user-1"></div>"

  Again we may specify the tag as well:
  
    ul#menu
      li: a(href='/home') Home
      li: a(href='/store') Store
      li: a(href='/contact') Contact

  Finally all of these may be used in any combination,
  the following are all valid tags:
  
    a.button#contact(style: 'color: red') Contact
    a.button(style: 'color: red')#contact Contact
    a(style: 'color: red').button#contact Contact

## Block expansion

  Jade supports the concept of "block expansion", in which
  using a trailing ":" after a tag will inject a block:
  
    ul
      li: a Foo
      li: a Bar
      li: a Baz

## Text

   Arbitrary text may follow tags:
   
     p Welcome to my site
  
  yields:
  
     <p>Welcome to my site</p>

## Pipe text

  Another form of text is "pipe" text. Pipes act
  as the text margin for large bodies of text.

    p
      | This is a large
      | body of text for
      | this tag.
      | 
      | Nothing too
      | exciting.

  yields:
  
    <p>This is a large
    body of text for
    this tag.

    Nothing too
    exciting.
    </p>

  Using pipes we can also specify regular Jade tags
  within the text:
  
    p
      | Click to visit
      a(href='http://google.com') Google
      | if you want.

## Text only tags

  As an alternative to pipe text you may add
  a trailing "." to indicate that the block
  contains nothing but plain-text, no tags:

    p.
      This is a large
      body of text for
      this tag.

      Nothing too
      exciting.

  Some tags are text-only by default, for example
  _script_, _textarea_, and _style_ tags do not
  contain nested HTML so Jade implies the trailing ".":
  
    script
      if (foo) {
        bar();
      }

    style
      body {
        padding: 50px;
        font: 14px Helvetica;
      }

## Template script tags

  Sometimes it's useful to define HTML in script
  tags using Jade, typically for client-side templates.
  
  To do this simply give the _script_ tag an arbitrary
  _type_ attribute such as _text/x-template_:
  
    script(type='text/template')
      h1 Look!
      p Jade still works in here!

## Interpolation

  Both plain-text and piped-text support interpolation,
  which comes in two forms, escapes and non-escaped. The
  following will output the _user.name_ in the paragraph
  but HTML within it will be escaped to prevent XSS attacks:
  
    p Welcome #{user.name}

  The following syntax is identical however it will _not_ escape
  HTML, and should only be used with strings that you trust:
  
    p Welcome !{user.name}
  
## Inline HTML

  Sometimes constructing small inline snippets of HTML
  in Jade can be annoying, luckily we can add plain
  HTML as well:
  
    p Welcome <em>#{user.name}</em>

## Code

  To buffer output with Jade simply use _=_ at the beginning
  of a line or after a tag. This method escapes any HTML
  present in the string.
  
    p= user.description
    
  To buffer output unescaped use the _!=_ variant, but again
  be careful of XSS.
  
    p!= user.description
  
  The final way to mess with JavaScript code in Jade is the unbuffered
  _-_, which can be used for conditionals, defining variables etc:
  
    - var user = { description: 'foo bar baz' }
    #user
      - if (user.description) {
        h2 Description
        p.description= user.description
      - }

   When compiled blocks are wrapped in anonymous functions, so the
   following is also valid, without braces:
   
     - var user = { description: 'foo bar baz' }
     #user
       - if (user.description)
         h2 Description
         p.description= user.description

   If you really want you could even use `.forEach()` and others:
   
    - users.forEach(function(user){
      .user
        h2= user.name
        p User #{user.name} is #{user.age} years old
    - })

   Taking this further Jade provides some syntax for conditionals,
   iteration, switch statements etc. Let's look at those next!

## Assignment

  Jade's first-class assignment is simple, simply use the _=_
  operator and Jade will _var_ it for you. The following are equivalent:
  
    - var user = { name: 'tobi' }
    user = { name: 'tobi' }

## Conditionals

  Jade's first-class conditional syntax allows for optional
  parenthesis, and you may now omit the leading _-_ otherwise
  it's identical, still just regular javascript:
  
    user = { description: 'foo bar baz' }
    #user
      if user.description
        h2 Description
        p.description= user.description

  Jade provides the negated version, _unless_ as well, the following
  are equivalent:
  
    - if (!(user.isAnonymous))
      p You're logged in as #{user.name}

    unless user.isAnonymous
      p You're logged in as #{user.name}

## Iteration

  JavaScript's _for_ loops don't look very declarative, so Jade
  also provides its own _for_ loop construct, aliased as _each_:

    for user in users
      .user
        h2= user.name
        p user #{user.name} is #{user.age} year old

   As mentioned _each_ is identical:
   
     each user in users
       .user
         h2= user.name

   If necessary the index is available as well:
   
      for user, i in users
        .user(class='user-#{i}')
          h2= user.name

   Remember, it's just JavaScript:
   
      ul#letters
        for letter in ['a', 'b', 'c']
          li= letter

## Mixins

  Mixins provide a way to define jade "functions" which "mix in"
  their contents when called. This is useful for abstracting
  out large fragments of Jade.

  The simplest possible mixin which accepts no arguments might
  look like this:
  
      mixin hello
        p Hello

   You use a mixin by placing `+` before the name:

      +hello

   For something a little more dynamic, mixins can take
   arguments, the mixin itself is converted to a javascript
   function internally:
   
       mixin hello(user)
         p Hello #{user}

       +hello('Tobi')
  
   Yields:

       <p>Hello Tobi</p>

  Mixins may optionally take blocks, when a block is passed
  its contents becomes the implicit `block` argument. For
  example here is a mixin passed a block, and also invoked
  without passing a block:

      mixin article(title)
        .article
          .article-wrapper
            h1= title
            if block
              block
            else
              p No content provided
      
      +article('Hello world')
      
      +article('Hello world')
        p This is my
        p Amazing article

   yields:
   
       <div class="article">
         <div class="article-wrapper">
           <h1>Hello world</h1>
           <p>No content provided</p>
         </div>
       </div>

       <div class="article">
         <div class="article-wrapper">
           <h1>Hello world</h1>
           <p>This is my</p>
           <p>Amazing article</p>
         </div>
       </div>

  Mixins can even take attributes, just like a tag. When
  attributes are passed they become the implicit `attributes`
  argument. Individual attributes can be accessed just like
  normal object properties:
  
      mixin centered
        .centered(class=attributes.class)
          block
      
      +centered.bold Hello world
      
      +centered.red
        p This is my
        p Amazing article
  
   yields:
   
       <div class="centered bold">Hello world</div>
       <div class="centered red">
         <p>This is my</p>
         <p>Amazing article</p>
       </div>
  
   If you use `attributes` directly, *all* passed attributes
   get used:
   
      mixin link
        a.menu(attributes)
          block
      
      +link.highlight(href='#top') Top
      +link#sec1.plain(href='#section1') Section 1
      +link#sec2.plain(href='#section2') Section 2
  
   yields:
   
       <a href="#top" class="highlight menu">Top</a>
       <a id="sec1" href="#section1" class="plain menu">Section 1</a>
       <a id="sec2" href="#section2" class="plain menu">Section 2</a>
   
   If you pass arguments, they must directly follow the mixin:
   
      mixin list(arr)
        if block
          .title
            block
        ul(attributes)
          each item in arr
            li= item
      
      +list(['foo', 'bar', 'baz'])(id='myList', class='bold')
  
   yields:
   
       <ul id="myList" class="bold">
         <li>foo</li>
         <li>bar</li>
         <li>baz</li>
       </ul>
