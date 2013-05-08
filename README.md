# Semantic

Semantic is a set of specifications for sharing UI elements between developers. Semantic is also a UI library, like Bootstrap, made to make front end development simpler.

## About
Semantic's goal is to create conventions for html structures and class names of interface elements so that developers can exchange designs for UI components without restructuring their codebase. 

Semantic also tries to make web development more easy to learn, by reducing the complexity of html, and providing syntax based on natural language making it easier to define relationships like, singular and plural definitions. nouns and adjectives.

For example here is Semantic's definition of a button

```html
    <div class="ui button"></div>
```
A button can sometimes be active, or selected by the user

``` html
    <div class="ui active button">
```

A button may sometimes look different than a simple button. 
``` html
    <div class="ui large blue icon button">
      <i class="ui icon heart"></i>
    </div>
```

A button can sometimes exist in a group of buttons
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

UI components are split into four categories: 
* UI elements
* UI Collections
* UI VIews
* UI Modules

All UI definitions are made of a neutral prototypical definition, a list of states it can occupy, and a set of common variations or "types" of that element. 

### UI Elements
UI Elements are design elements are most useful to define on a singular level. They may also may be useful sometimes to define in plural. Groups of UI elements are always homogenous.

For example in this case each button does not have to separately be defined as "large":

`` html
    <div class="large buttons">
      <div class="ui button">Cancel</div>
      <div class="ui positive button">Continue</div>
    </div>
``

Examples of UI elements:
* Buttons
* Labels
* Headers
* Progress bars


### UI Collections
UI Collections are groups of heteregeneous UI elements which are usually found together. UI collections do not usually require all elements to be found, but they describe a list of the "usual suspects".Collections are not typically useful to define in plural.

Examples of UI collections: 
* Forms
* Tables
* Grids (Layout)
* Menus
 
## UI Views
UI Views are common ways that UI elements are grouped together to display lists of site content. These might be slightly prescriptive, but 


## UI Modules

UI modules are UI elements where it's behavior is a fundamental part of its definition.

Examples of UI modules:
* Popups
* Modals
* Chatrooms
* Calendar Pickers

Views consist of things like: **activity feeds, user lists, product lists**. 

Semantic is also a UI library, written to match the specification.


## Usage

### Specification

#### I want to contribute to the spec

Semantic is very new. Semantic aims to provide class name and structural definitions of all common UI tropes, and there are still lots of components which do not have standards written. 

First, look at [foo]zzz

We're currently working to figure ouin [coding guidelines](http://semantic-ui.com/guidelines).

#### I want to code a UI component using the semantic standard

Great! It's nice to meet you. Ju



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
