## RELEASE NOTES

### Version 0.3.4 - Oct 2, 2013

**Fixes**
- Transitions now work in Safari versinos that do not support animation-direction
- Fixes accordion in safari styles getting stuck

### Version 0.3.3 - Oct 2, 2013

**Fixes**
- Fixes modal not working due to destroy teardown in dimmer Issue #153
- Fixes selector for checkbox to fix radio boxes Issue #154
- Fixes issue with popup display in some edge cases Issue #128

**Updates**
- Headers and lists with icons now do not break with multiline content
- Examples resize with browser width
- Updates ACE editor library
- Code samples now do not change after interacting with examples

### Version 0.3.2 - Oct 2, 2013

**Updates**
- Dropdown now formats top and right arrow icons automatically with icon coupling with sub menus
- Updates feed example with more feature examples
- Adds more sizes to ratings
- Makes active pagination item style more clear
- Adds attach events method to modal for attaching modal events to other elements
- Adds input focus/blur to modal, see Issue #124
- Adds new methods to rating: 'get rating', 'clear rating', 'disable', 'enable', adds new setting 'clearable'

**Fixes**
- Fixes position of menu dropdowns in some cases
- Updates modal to refocus elements after close
- Right floated list content now receives left margin
- List items display issues with icons + content
- Fixes rating line height issue
- Fixes rating not being sent as first callback parameter on 'onRate'
- Lists items now auto clear floats
- Fixes icon input inside a menu placement issues

### Version 0.3.1 - Sep 30, 2013

**Fixes**
- Fixes Page Grid still receiving negative margin

### Version 0.3.0 - Sep 30, 2013

**Fixes**
- Responsive Grid is now called "Page Grid". Responsive grids are now deprecated. This reduces confusion.
- Negative margins are now automatically removed from grids that are descendents of body tag.

### Version 0.2.5 - Sep 28, 2013

**Fixes**
- Fixes checkbox  selector issue with multiple inputs inside a checkbox
- Modal no longer uses inline css to center when in fixed position mode
- Fixes dropdown to now set active item to whatever hidden input field is when using action updateForm

### Version 0.2.4 - Sep 28, 2013

**Updates**

- Fixes issue with display on Chromebook Pixel and some devices
- Fixes issues with concatenated version receiving conflicted icon definitions causing icons to not function

### Version 0.2.3 - Sep 28, 2013

**Updates**

- Fixes issues with modal not swapping to absoultely positioned from fixed when content cannot fit in viewport

### Version 0.2.2 - Sep 28, 2013

**Updates**

- Fixes invoke returning found function instead of results of found function in dropdown, modal

### Version 0.2.1 - Sep 28, 2013

**Updates**

- Modals can now have an icon in its left content that will be automatically formatted
- Preserve 3D animations are now on by default for dimmers

**Fixes**

- Transition now forces browser repaint after animation
- Refactored modal and dimmer components
- Modal will now resize when browser window resizes if vertical height changes
- Fixes issues with dimmer settings sticking between separate modals with the same dimmer.

### Version 0.2.0 - Sep 28, 2013

**New**

- Adds responsive modal styling, modal always now sits with 5% gutters under page grid responsive styling
- Adds basic modal variation

**Fixes**

- Issue with modal active state not being removed correctly from modals
- Swaps modal and dropdown to use same variable naming pattern as rest of modules
- Removed selector count from performance logs

### Version 0.1.0 - Sep 25, 2013

**New**

- Added new font icon set using Font Awesome port
- Adds dropdown icon sexiness to accordions, now with rotating pointing arrows
- Added old icon set as a separate basic icon set
- Added fluid input variation
- Increased size of corner labels
- Adds relaxed grid variation with increased gutters
- Added relaxed and very relaxed list type with increased padding

**Fixes**

-  Rating icon missing font content with icon font update
- Padding on side of rating
- Adds horizontally padded, vertically padded menu item variations to allow menu items to remove padding
- Added fixes to tabular menu especially with attached content
- UI Loaders now positioned automatically in all circumstances, even with long text
- Connected items no longer assume 3 items per row
- Fixes display of left corner icon labels

**Updates**

- Updated documentation for sidebar, transition, and form validation
- Updated list docs
- Accordion settings documentation
- Rating settings documentation
