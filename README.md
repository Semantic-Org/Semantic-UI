# Semantic

Semantic is a set of specifications for sharing UI elements between developers. Semantic is also a UI library to make front end development simpler and easier to learn.

## Development Status

Semantic is pre-release. Build tools are not yet available, and APIs may be updated regularly prior to 1.0, so be warned!

Please [share any issues](https://github.com/jlukic/Semantic-UI/issues?state=open) you may have, we need your help to get all the kinks out. 

If you need to create a test case, you can [fork this jsfiddle](http://jsfiddle.net/jlukic/Vbr9d/1/) to get you started.

If you want to keep track of development, please [join our google group](https://groups.google.com/forum/?hl=en#!forum/semantic-ui)

## The Library

### Getting Started

The Semantic library describes many UI elements. In most instances it might be best to build a custom build with only the elements you need.

*Build tools are not yet available but stay tuned!*

~~You can use our build tool to select only the components you want~~

To download the entire library

    git clone git@github.com:quirkyinc/semantic.git

If you prefer to download the whole kit as a zip, it is so conveniently packaged.

    http://semantic-ui.com/build/semantic.zip

## The Specification

The aim of the specification is to develop conventions around structuring and naming code for interface elements.

By defining a vocabulary the development community can exchange javascript and css definitions of UI in a similar language, making new code easier to grok, and reducing the complexity of starting a new project, or changing a sites design.

## Types of UI

UI components are split into four categories, ranging from smallest to largest in scope:
* UI Elements
* UI Collections
* UI Modules
* UI Views

### UI Elements
UI Elements are interface elements which do not contain other elements inside themselves. This can be thought of as similar in definition as an "element" in chemistry.

UI elements can have plural definitions when they are known to exist together frequently.

In this case each button will be large because we understand it is a part of the large button group
``` html
<div class="large ui buttons">
  <div class="ui button">Cancel</div>
  <div class="ui button">Continue</div>
</div>
```

Examples of UI elements:
* Buttons
* Labels
* Headers
* Progress bars


### UI Collections
UI Collections are groups of heteregeneous UI elements which are usually found together. Carrying the chemistry metaphor, these can be thought of as molecules.

UI collections have a definition of elements that exist, or could exist inside of them. They do not usually require all elements to be found, but they describe a list of the "usual suspects". Unlike elements, collections are not typically useful to define in plural.

Examples of UI collections:
* Forms
* Tables
* Grids (Layout)
* Menus


### UI Modules

UI modules are elements where it's behavior is a fundamental part of its definition. UI Modules are dependent on the javascript which carry their definition. They also may be more complex, and have a variety of different functions. Further abusing the scientific analogy: These can be thought of as "organs".

Examples of UI modules:
* Popups
* Modals
* Chatrooms

### UI Views
UI Views are common ways to structure types of content so that it can be understood more easily. A view's definition in semantic only describes the content which typically occupies the view.

Examples of UI views:
* Comment Feed
* Activity Feed
* Product List

### How it is defined

#### Scope of a definition

**All UI**: The specification defines class name and html structures which can be used to represent an element

**Elements**: An element definition gives states which an elements can occupy, common types of that element, and if necessary, defines how the element functions in groups.

**Collections**: Collection definitions list elements that it can include, and variations which can apply to both the collection, or individual elements found in the collection.

**Modules**: Module definitions include a list of behaviors that are commonly associated with an element

**Views**: View specifications defines the types of content the view usually display, and the heirarchy typical to presenting this content to the user.

#### Based on class

Semantic is based on class names, instead of tags. This means, except for links, tables and form elements, you can use semantic with tags like ``<div> <article> <nav>`` without any difference.

#### Context sensitive

In Semantic, variations maintain context based on the element they modify, but keep the same vocabulary between elements. Just like how in English, the adjective 'big' may describe a different scale for a big planet versus a big insect.

For example, a form you can have a variation called "inverted". This changes the appearance of form elements to work on dark backgrounds.
```html
<div class="ui inverted form">
    <div class="field">
        <label>Name</label>
        <input type="text">
    </div>
</div>
```

The same variation can also be useful in the context of a menu.
```html
<div class="ui inverted menu">
    <div class="item">Section 1</div>
    <div class="ui simple dropdown item">
        Dropdown
        <div class="menu">
            <div class="item">Dropdown item 1</div>
            <div class="item">Dropdown item 2</div>
        </div>
    </div>
</div>
```

#### Example

Here is part of Semantic's definition of a button

**Standard**: A button is a shape that can be pressed in to complete an action.
```html
    <div class="ui button"></div>
```
**State**: A button can sometimes be active, designating it is selected by the user.

```html
<div class="ui active button">
```

**Variations**: A button may sometimes look different than its prototype.
```html
<div class="ui large blue icon button">
  <i class="ui icon heart"></i>
</div>
```

**Plurality**: A button can sometimes exist in a group of buttons
``` html
<div class="ui large blue buttons">
  <div class="ui button">
    I am blue
  </div>
  <div class="ui button">
    I am blue too
  </div>
</div>
```


## Usage

### Developers

Prereqs Node, Grunt(``npm install -g grunt-cli``) and DocPad (``npm install -g docpad``)

Inside ``node/`` use the command ``docpad run`` to start your server

You can then access the docs locally at ``localhost:9778``

To have DocPad watch for changes while working on a component simply run the command
``grunt``

To build the release packages for Semantic
``grunt build``

#### I want to contribute to the spec

Semantic is very new standard, and we need a community to become truly useful. We're working currently to determine the best ways to engage the community for contribution. If you'd like to participate feel free to reach out by e-mail [jack@myfav.es](mailto:jack@myfav.es)

