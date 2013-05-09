# Semantic

Semantic is a set of specifications for sharing UI elements between developers. Semantic is also a UI library to make front end development simpler and easier to learn.

## About
Semantic's goal is to define a vocabulary for interface elements based on consensus, and convention.

For developers, this means defining class names for UI elements, outlining states that an elements can exist, and describing common variations of that element. 


### Getting Started

The Semantic library describes many UI elements which might not exist on every website. In most instances it might be best to build a custom build with only the components you need.

You can use our build tool to select only the components you want

    http://semantic-ui.com/download

Or download the entire library and build out the code yourself using Grunt or another package management system.

    git clone git@github.com:quirkyinc/semantic.git

If you prefer to download the whole kit and kaboodle you can grab that as well.
    http://semantic-ui.com/ui/semantic.min.css
    http://semantic-ui.com/ui/semantic.min.js

## A More Semantic Web

### Based on class

Semantic is based on class names, instead of tags. This means, except for links, tables and form elements, you can use semantic with tags like ``<div> <article> <nav>`` without any difference.

### Context sensitive

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
    <div class="dropdown item">
        Dropdown
        <div class="menu">
            <div class="item">Dropdown item 1</div>
            <div class="item">Dropdown item 2</div>
        </div>
    </div>
</div>
```

### Defining UI

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

## Types of UI

UI components are split into four categories, ranging from smallest to largest: 
* UI Elements
* UI Collections
* UI Modules
* UI Views

All UI definitions are made of a neutral, ideal definition, a list of states it can occupy, and a set of common variations or "types" of that element. 

### UI Elements
UI Elements are interface elements which do not contain other elements inside themselves. This can be thought of as similar in definition as an "element" in chemistry.

UI elements can have plural definitions when they are known to exist together frequently. 

In this case each button will be large because we understand it is a part of the large button group
``` html
<div class="large buttons">
  <div class="ui button">Cancel</div>
  <div class="ui positive button">Continue</div>
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
 

## UI Modules

UI modules are elements where it's behavior is a fundamental part of its definition. UI Modules are dependent on the javascript which carry their definition. They also may be more complex, and have a variety of different functions. Further abusing the scientific analogy: These can be thought of as "organs".

Examples of UI modules:
* Popups
* Modals
* Chatrooms
* Calendar Pickers

## UI Views
UI Views are common ways to structure types of content so that it can be understood more easily. A view's definition in semantic only describes the content which typically occupies the view.

For example an activity feed in 
This is a UI

Examples of UI views:
** Comment Feed
** Activity Feed
** Product List


## Usage

### Specification

#### I want to contribute to the spec

Semantic is very new standard, and we need a community to become truly useful. We're working currently to determine the best ways to engage the community for contribution. If you'd like to participate feel free to reach out by e-mail [semantic@quirky.com](mailto:semantic@quirky.com)

