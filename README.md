# Semantic

Semantic is a set of specifications for sharing UI elements between developers. Semantic is also a UI library to make front end development simpler and easier to learn.

## About
Semantic's goal is to define a vocabulary for interface elements based on consensus, and convention.

For developers, this means defining class names for UI elements, outlining states that an elements can exist, and describing common variations of tnat element. 

## How
Just like English, adjectives, or *variations*, have meaning based on the context of the noun, the *ui element*. 

We know a big planet is a different size than a big house, but we can still describe the quality of something that is big. In the same way, in Semantic, variations maintain context based on the element they modify, but keep the same vocabulary between elements, e.g. a big activity feed, is different than a big progress bar.


For example here is part of Semantic's definition of a button

**Standard**: A button is a shape that can be pressed in to complete an action
```html
    <div class="ui button"></div>
```
**State**: A button can sometimes be active, or selected by the user

``` html
    <div class="ui active button">
```

**Variations**: A button may sometimes look different than a simple button. 
``` html
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

UI components are split into four categories: 
* UI elements
* UI Collections
* UI VIews
* UI Modules

All UI definitions are made of a neutral prototypical definition, a list of states it can occupy, and a set of common variations or "types" of that element. 

### UI Elements
UI Elements are basic design elements. Any part of the element cannot be thought of as something separate, although they may be made up of parts. In chemistry, you can think of this as an "element".

They may also may be useful sometimes to define in plural. Groups of UI elements are always homogenous.

For example in this case each button can be described as large because we understand it is a type of large button
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
UI Collections are groups of heteregeneous UI elements which are usually found together. These can be thought of as molecules.

UI collections do not usually require all elements to be found, but they describe a list of the "usual suspects". Collections are not typically useful to define in plural.

Examples of UI collections: 
* Forms
* Tables
* Grids (Layout)
* Menus
 
## UI Views
UI Views are common ways that UI collections are grouped together. The focus is not on providing a specific interaction, but providing a view for a website's content. These might be difficult to define completely.

Examples of UI views:
** Comment Feed
** Activity Feed
** Product List


## UI Modules

UI modules are UI elements where it's behavior is a fundamental part of its existence. 

Examples of UI modules:
* Popups
* Modals
* Chatrooms
* Calendar Pickers

## Usage

### Specification

#### I want to contribute to the spec

Semantic is very new. We're still working out the best way to join in the discussion.

We're currently working to figure ouin [coding guidelines](http://semantic-ui.com/guidelines).


###Library

You can use our build tool to select only the components you want
  http://semantic-ui.com/download

Or download the whole kit and kaboodle
  http://semantic-ui.com/ui/semantic.min.css
  http://semantic-ui.com/ui/semantic.min.js
  


  
  

* **Designers**: Semantic, provides a standard set of des
* **Authors**: If you'd like to design elements to be available for other developers, download the author's distribution pack which includes a definition pack to help you start writing custom designs for Semantic.

Why Semantic
-------------

HTML is developed by committee. Seman
