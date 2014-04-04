## RELEASE NOTES

### Version 0.15.4 - April 04, 2014

**Fixes**
- **Rating** - Fixes issue where rating was behaving erratically in Chrome

### Version 0.15.3 - April 04, 2014

**Changes**
- **Transition** - CSS Transitions now work in legacy FF (FF > 12)
- **All UI** - Adds support for legacy FF vendor prefixes (FF > 12)

**Docs**
- Adds more examples for static checkbox/radio boxes with HTML only
- Fixes a variety of issues with malformed examples (thanks community)

### Version 0.15.2 - Mar 28, 2014

**Changes**
- **All Modules** - Debug is now disabled by default

**Fixes**
- **Step** - Fixes issue with border radius on vertical steps
- **Icon** - Orange color is now available for icon
- **Menu** - Fixes formatting of attached segments with menus

### Version 0.15.1 - Mar 14, 2014

**Critical Fixes**
- **Dropdown** - Typo in dropdown css was causing selection dropdowns not to appear

### Version 0.15.0 - Mar 14, 2014

**Enhancements**
- **Step** - Vertical Steps now have option to have two line items
- **Form** - Forms, Dropdowns, and Inputs now have matching padding size, and use 1em font size to appear same size as surrounding text
- **Icon** - Icons on dark backgrounds should render better in OSX
- **Modal** - Modals now have an onVisible and onHidden callback for after animation ends
- **Form Validation** - Form validation now automatically revalidates a selection dropdown on change when invalid

**Critical Fixes**
- **Modal** - Browsers without RequestAnimationFrame (Opera) were erroring on modal show
- **Dropdown** - Element's with numeric ``data-text`` values were erroring when selected

**Fixes**
- **Modal** - Modal onShow and onHide occurs before transition starts, allowing for class name changes not to be reset
- **Dropdown** - Default selection text was not appearing when a dropdown had a value that was ``false`` or ``0``
- **Input** - Fixes slight error in corner label rounding **Thanks MohammadYounes**
- **Reveal** - Reveals will now show on active, for touch devices **Thanks Illyism**
- **Table** - Fixes rounding on tables with multiple tfoot elements **Thanks webdesserts**
- **Icon** - Hide and unhide icon were accidentally given opposite names
- **Checkbox** - Checkboxes can now have multiple inputs inside, for use with .NET and other languages that insert their own hidden inputs

**Project**
- **iOS** - Active styles, for example pressed in buttons, now appear in docs on touch devices

### Version 0.14.0 - Mar 03, 2014

**Enhancements**
- **Modal** - Modal now uses requestAnimationFrame instead of debounced callback
- **Dropdown** - Dropdown now has error state **Thanks Musatov**
- **Form** - Form fields with errors will now properly style dropdown elements **Thanks Musatov**
- **Step** - Steps can now appear vertically

**Fixes**
- **List** - Bulleted and horizontal lists now appear correctly in IE10-11

**Project**
- **NPM** - Docpad is now moved to a dev dependency **Thanks kapouer**

### Version 0.13.1 - Feb 28, 2014

**Fixes**
- **Modal** - Fixes modal positioning appearing slightly below center on second load
- **Checkbox** - Fixes checkbox appearance inside inverted forms
- **Input** - Fixes ui input to inherit form sizing
- **Accordion** - Fixes issues with accordion rules being too specific, causing several common usages of accordions to break
- **Form Validation** -  Fixes form validation regular expression matching **Thanks icefox0801**


### Version 0.13.0 - Feb 20, 2014

**Enhancements**
- **Label** - Corner labels now are coupled to have rounded edges with components with rounded edges like input
- **Form** - Grouped form fields now have responsive styles for mobile
- **Modal** - Modal will now work when modal is taller than page's content
- **Checkbox** - Checkboxes now also trigger DOM ``change`` event
- **Accordion** - Accordions now preserve inline styles when animating
- **Form Validation** - Form validation now rechecks on all form change events, not just input change

**Fixes**
- **Menu** - Fixes 2px border on last element in horizontal menus
- **Menu** - Fixes dropdown formatting when used **inside* a menu item
- **Menu** - Fixes formatting of grouped icon buttons inside menus
- **Modal** - Fixes z-index of modal close to appear above ``relative/absolute`` modal content on mobile
- **Dimmer** - Dimmers are less buggy when used with ``on: 'hover``


### Version 0.12.5 - Feb 04, 2014

**Enhancement**
- **Button** - Or buttons can now have text specified using ``<div class="or" data-text"text">`` with alternate text *Thanks MohammadYounes*

**Fixes**
- **Popup** - Fixes issue where popups using ``title`` attribute to store data were losing title content instead of correctly restoring it
- **Modal** - Fixes an issue where modal may not position correctly in some cases *Thanks GianlucaGuarini*
- **Modal** - Fixes modal throwing an error when transition is not included *Thanks robertoles*

### Version 0.12.4 - Jan 29, 2014

**Fixes**
- **Form** - Fixes issue with onSuccess not allowing cancellation of form submit in form validation
- **Input** - Fixes ``ui buttons`` to work inside an ``ui action input`` **Thanks MohammadYounes **
- **Items** - Fixes ``ui horizontal items`` to work correctly, missing comma **Thanks mishak87**

**Project**
- **RTL** - Adds RTL hinting for some files **Thanks MohammadYounes**
- **Specs** - Adds additional JSON spec files for future use with generators **Thanks brigand**

### Version 0.12.3 - Jan 24, 2014

**Fixes**
- **Message** - Fixes some issues with margins sometimes not appearing with ``attached message`` **thanks joltmode**
- **Item** - Fixes color repeating to be consistent for items **thanks skysplit**

### Version 0.12.2 - Jan 21, 2014

**Enhancement**
- **Form Validation** - Adding custom validation is now simpler, uses syntax ``$('.form').form('add prompt', identifier, 'Error message');``

**Fixes**
- **Menu** - Slightly updates input sizes inside menus
- **Grid** - Fixes grid ``only tablet/mobile/computer`` showing both devices on exact pixel of breakpoint, i.e. 768px
- **Icon** - Fixes ascending alphabetic inheritance

### Version 0.12.1 - Jan 15, 2014

**Fixes**
- **LESS** - Fixes typo breaking less parsing **thanks DVSoftware**
- **Menu** - Fixes buttons using ``<a>`` tag from inheriting link styles. **thanks joltmode**
- **Menu** - Fixes ``action input`` to work inside menus  **thanks joltmode**
- **Modal** - Fixes possible race conditions in animations of modal **thanks dos1**
- **Message** - Prevents close icon from being misformatted in icon message **thanks MohammadYounes**

**Docs**
- **Icons** - Fixes some icon code samples in docs **thanks mishak87**
Some updates to docs formatting

### Version 0.12.0 - Jan 06, 2014

**Major Fixes**
- **Dropdown** - Fixes dropdowns links not working on touch devices
- **Input** - Fixes input placeholder styles to work (accidental regex replace)

**Major Updates**
- **Transition** - Transitions will now, by default, prevent the current animation from being queued while it is actively animating the same animation
- **Modal** - New setting ``allowMultiple`` lets you specify whether multiple modals can be shown at once
- **Modal** - New setting ``detachable`` allows you to specify whether modal DOM element can be moved (Thanks MohammadYounes)

**Updates**
- **Dropdown** - Default value is now stored on init, and can be restored using 'restore defaults' behavior
- **Modal** - Buttons can now use both ``cancel/deny`` or ``ok/approve``, for approve/deny events to fire (Thanks MohammadYounes)
- **Menu** - Fixed menu now adds padding on the next element if it is a grid
- **Progress Bar** - Adds warning color

**Fixes**
- **Icon** - Fixes unnecessary formatting on thumbs up/down
- **Dropdown** - Fixes touchmove event not clearing on touch devices causing unnecessary overhead
- **Input** - Action inputs can now be fluid
- **Sidebar** - Fixes issue where top sidebar was receiving left offset
- **Menu** - Fixes z-index on fixed menu to exist just below modals
- **Dropdown** - Fixes issue where last match was returned, not prioritizing value over text
- **Form** - Fixes all validation input to be trimmed for whitespace

### Version 0.11.0 - Dec 25, 2013

### Merry Christmas!

**Major Updates**

-**Transition**: Transition has been completely rewritten, performance should be about 10x after first animation due to caching and use of request animation frame

**New Features**

-**Transition**: Transitions now work with **any display type** not just display: block, meaning transitions can be used on buttons and other inline elements without affecting display

**Fixes**

-**Transition**: Fixes typo in "horizontal flip out" causing opacity to be fading in

-**Popup** - Fixes popup sometimes opening and closing when ``event:click`` is used and a user double clicks

-**Modules**: Fixed error in all modules where calling invoke would modify instance outside of scope, making it impossible to access some data (for instance cached positions) from outside of module.

-**Modal**: Fixes issues with modal in IE, IE11 can now use CSS animations with modals

### Version 0.10.3 - Dec 22, 2013

**Critical Fixes**
- **Dropdown** - Fixes issue where dropdown animation does not occur sometimes (Thanks MohammadYounes)

**Fixes**
- **Popup** - Native browser popups no longer if using ``title`` attribute
- **Grid** - Fixes issue where stackable grid was not working correctly when using (x) wide column
- **Modal** - Fixes element detatching sometimes in case where it is already inside a dimmer
- **Input** - Removes duplicate sizes

### Version 0.10.2 - Dec 13, 2013

**New**
- **Button** - Adds VK button
- **Input** - Action inputs now support button groups

**Fixes**
- **Rating** - Fixes vertical alignment with text
- **Dropdown** - Fixes missing easing equations for dropdown javascript animations. Would cause an error when no css transitions were included and jquery easing was not available.

### Version 0.10.1 - Dec 06, 2013

**Fixes**
- **Modal** - Fixes issue with modal animation regression in 0.10.0

### Version 0.10.0 - Dec 05, 2013

**New**
- **Grid** - Adds ``doubling`` responsive variation which automatically formats content spacing based on device type
- **Form Validation** - Adds two new parameters, to allow for changing of revalidation and delay on input

**Updates**
- **Grid** - Row padding is now EM not % based, this might shift layouts slightly
- **Grid** - Grid columns not inside a row will automatically receive row padding now. This will allow for content to flow correctly when row count is unknown

**Fixes**
- **Grid** - Fixes margin on stackable grids
- **Dropdown** - Value can be retrieved even in instances where forms arent used

### Version 0.9.6 - Dec 04, 2013

**Updates**
- **Rating** - Ratings now recieve class disabled when read only, instead of recieving ``active`` when rateable since active are much more common
- **Grid** - Fixes some instances where grid column width ``x wide`` was being overruled by parent element ``x column``.
- **Header, Grid, Segment** - Adds justified alignemnt
- **Message** - Fixes issues with attached icon message (thanks overra)

### Version 0.9.5 - Nov 25, 2013

**New**
- **Segment** - Segments now have a circular variation

**Fixes**
- LESS files now include vendor prefixes by default instead of only including them in css releases

### Version 0.9.4 - Nov 24, 2013

**Fixes**
- **Dropdown** - Fixes issue where falsey value (i.e. 0) could not be selected
- **Transition** - Fixes transition exists function from not being called
- **Form** - Adds input type="url" to forms
- **Sidebar** - Fixes right sidebars to correctly allow for sizing (Thanks DveMac)
- **Sidebar** - Typo in sidebar header (Thanks slobo)


**Docs**
- Fixes various typos and missing closing html tags

### Version 0.9.3 - Nov 17, 2013

**Fixes**
- **Dropdown** - Fixes "falsey" values (like 0) not being processed correctly
- **Segment** - Fixes segment text color when nested inside inverted segment
- **Button** - Fixes improper active/visible state due to :not specificity (most noticiable in mousedown on a dropdown button)

### Version 0.9.2 - Nov 8, 2013

**Fixes** - Fixes popup not repositioning itself when offstage.

### Version 0.9.1 - Nov 7, 2013

**New**
- **Popup** - Adds context option for popup (thanks jefmathiot)
- **Accordion** - Adds formatting for nested accordions

**Updates**
- **Accordion** - Fixes issue with accordion events inside accordions

### Version 0.9.0 - Nov 5, 2013

**New**
- **Button** - Basic icons now have inverted style
- **Segment** - Segments can now be used with ``ui grid`` and ``ui grid column/row``
- **List** - Adds animated list variation

**Docs**
- **Release** - Fixes issues with minification in grunt
- **Examples** - Adds new homepage example to release zip
- **Code Samples** - Updates ACE editor version

**Updates**
- **List** - Updated some list styles for greater flexibility
- **Dropdown** - Dropdown now always receives pointer cursor in all types
- **Form** - Darkens placeholder text color to be more visible
- **Menu** - Dropdown position inside secondary menus should be more precise
- **Input** - Labeled icons now have smaller corner labels
- **Menu** - Floating dropdown menus now work inside menus
- **Button** - UI buttons no longer have shadows, this helps match colored buttons in layouts

**Fixes**
- **Header** - Fixes alignment of solo icons in headers
- **Button** - Fixes labeled icon placement in Chrome
- **Modal** - Fixes use of unsupported comma separated :not selector
- **Modal** - Fixes left/right ui content receiving modal styles inappropriately
- **Menu** - Fixes some inverted menu stylings not applying correctly in some instances
- **Grid** - Fixes comp/tablet/mobile only columns not working if not inside a row

### Version 0.8.6 - Nov 2, 2013

**Fixes**
- **Modal** - Fixes issue with scrollable variation on mobile, updates mobile styles

**Docs**
- Fixes bug in jquery waypoint 2.0.3 causing menus to be lame

### Version 0.8.5 - Nov 2, 2013

**Fixes**
- **Modal** - Fixed issue with modals not working in 0.8.4 due to mistake in transition invoke
- **Modules** - Invoke now gives user's query in error message for method not found

### Version 0.8.4 - Nov 1, 2013

**Fixes**
- **Modules** - Fixes bug where invoking a sentence behavior that has a single word match would always invoke single word match. I.e. ``show modal`` would mistakenly call ``show`` if it existed.
- **Modules** - Adds CSS transition support detection to all modules using css transitions to allow for graceful degradation for IE8

**Docs**
- **Download** - Fixes issue where non minified source was being included with minified copy
- **IE** - Fixed some issue with IE display in docs

### Version 0.8.3 - Oct 30, 2013

**Fixes**
- **Modal** - Adds fixes for opening modals when other modals are opened, adds a few new API behaviors
- **Form** - Fixes issues with form validation not escaping regex characters
- **Form** - Errored fields now have their icons and corner labels colored appropriately
- **Labels** - Fixes formatting of links inside labels

### Version 0.8.2 - Oct 28, 2013

**Fixes**
- **Modal** - Quick Fix for modal events in IE
- **Menu** - Fixes arrow direction on vertical menu dropdown
- **Button** - Fixes button height issue with button groups including icon and normal buttons

**Docs**
- Fixes some missing closing tags

### Version 0.8.1 - Oct 26, 2013

**Fixes**
- **Button** - Fixes colored version sometime losing white text color
- **Button** - Fixes 1pixel jump on animated fade buttons

**Docs**
- Prefixer now used for prefixing in grunt
- Spelling fixes

### Version 0.8.0 - Oct 25, 2013

**New**
- **Button** - Default button styles have been significantly tweaked
- **Button** - Evenly divided buttons can use number classes instead of words ``class="2 buttons"``
- **Button** - New animated button styles, fade, horizontal, and vertical

**Fixes**
- **Button** - Fixes "or" sizing to work for all sizes
- **Dropdown** - Fixes border radius on non-selection dropdowns from changing on activation
- **Input** - Action buttons now have tactile feedback like normal buttons

**Docs**
- Added more detailed contributing guide
- Updates info on setting up server
- Added new examples to button and input

### Version 0.7.2 - Oct 23, 2013

**Fixes**
- **Modal** - Fixes issue with modal hiding twice onApprove

### Version 0.7.1 - Oct 23, 2013

**Fixes**
- **Dropdown** - Fixes issue with dropdown icon position in chrome
- **Popup** - Fixes issue with popup's using setting inline: true

### Version 0.7.0 - Oct 22, 2013

**New**
- **Table** - Added aweosome new responsive style to ui tables
- **Button** - New social buttons for Instagram, LinkedIn, Google Plus, Pinterest
- **List** - Adds documentation for module format
- **List** - Adds onTabInit for local tabs on first load
- **List** - Popups can now have a different target than itself
- **Modal** - Modal hide can be cancelled from ``onApprove`` and ``onDeny`` by returning false from callback
- **Transition** - onShow and onHide callbacks for visibilit changing transitions
- **Shape** - New 'cube' and 'text' shape type
- **Shape** - Transition duration can now be set programatically
- **Shape** - New beforeChange callback
- **Sidebar** - Sidebar will now default to being exclusive and hiding other sidebars on show
- **Sidebar** - Sidebar now has onChange, onShow, onHide callbacks
- **Sidebar** - Sidebar now have several size variations, and a new styled variation that comes preformatted

**Docs**
- **Dimmer** - Adds more dimmer examples, fixes settings
- **Modules** - New examples and docs for all modules
- Adds sortable tables to docs
- New tabbed doc style for modules
- Code samples will now automatically format indention

**Fixes**
- **Button** - Fixes vertical fluid buttons not taking up full width
- **Shape** - Shape now works with no additional stylings
- **Shape** - Fixes calculation of next side size to work correctly by using offstage element
- **Modules** - Fixed issue when altering settings using ``module('setting')`` with an object
- **Dimmer** - Dimmer now obeys border radius of parent
- **Dropdown** - Dropdown cannot display inside item image
- **Dropdown** - Dropdown links were being prevented by event.preventDefault used for touch devices
- **Dropdown** - Fixes issue with borders on selection dropdown
- **Dropdown** - Fixes pointing dropdown to appear correctly in menu
- **List** - Celled tables now have celled table headers
- **Menu** - Fixes border radius on tabular menu, fixes one pixel jump on active state
- **Menu** - Removes vertical label width missing units in menu
- **Popup** - Popup .toggle() now always hides/shows popup correctly
- **Popup** - Popup fixed a bug where "top right" placed popup might sometimes be too large
- **Popup** - Popup will not reshow a visible popup on hover

**Updates**
- **Accordion** - Reduces vertical padding on basic accordion content
- **Header** - Block header now uses RGBA instead of solid color by default
- **Label** - Ribbon labels now have a shadow color
- **List** - Horizontal padding on icon list slightly increased, fixes to icon position
- **List** - Increased padding on attached labels
- **List** - Leading on bulleted and ordered list slightly increased
- **Message** - Increase opacity of icons on icon messages
- **Modal** - Optimizes dimmer init on modal to occur on modal init and not modal show
- **Popup** - Popup border now uses RGBA to look sexier on dark backgrounds
- **Popup** - Popup default duration is now 200ms (slighty slower)
- **Popup** - Popup metadata attribute arrowOffset is now offset for simplicities sake
- **Popup** - Popup no-longer receives class name 'visible' on show, this allows popups to be used on dropdowns and other elements with a visible state
- **Popup** - Popups are no longer inline by default
- **Table** - Table headers are now darker to increase contrast with rainbow striped rows
- **Sidebar** - Floating sidebar is slightly less heavily shadowed


### Version 0.6.5 - Oct 18, 2013

**Fixes**
- Fixes issue where browser default action, like link clicking, was prevented on dropdown item click
- Modal keyboard shortcuts now obey settings.closable (credit to luisrudge)


### Version 0.6.4 - Oct 16, 2013

**Fixes**
- Fixes issue where browser default action, like link clicking, was prevented on dropdown item click

### Version 0.6.3 - Oct 15, 2013

**Deprecation**
- Dropdown changeText and updateForm have been deprecated and will be removed in 1.0

**Updates**
- Dropdown hide no longer selects current item as active (useful for menus)
- Simplified possible dropdown actions changeText and updateForm are now consolidated into activate which is the new default

### Version 0.6.2 - Oct 15, 2013

**Fixes**
- Fixes touch+mouse like touchscreen laptops to work with dropdowns
- Fixes input position inside menus with no other content
- Fixes input sizing on small/large menus

**Updates**
- Dropdown vastly improved for touch, now can scroll with touch without closing dropdown
- Dropdown active style now slightly more noticable

### Version 0.6.1 - Oct 15, 2013

**Updates**
- Adds onApprove/onDeny callbacks to modal
- Adds small/large sizing of modal, reformats default modal size to be slightly inset from page grid
- Adds clockwise/counterclockwise rotated icon and default rotate
- Adds orange label/segment
- Adds automatic menu formatting for buttons inside menus
- Dropdowns in vertical menu automatically receive proper triangle pointer direction

**Fixes**
- Fixes modal spacing on left/right content to match up with grid gutters
- Fixes inheritance issues with rotated icon
- Fixes tests not passing for modal/dimmer
- Fixes overflow on item corner label
- Fixes right menu formatting in secondary menus
- Fixed shadow overlap on dropdown in menus

### Version 0.6.0 - Oct 14, 2013

**Updates**
- Adds travis CI support with preliminary test coverage for all javascript modules

**Fixes**
- Minor Fixes caught with testing suite, related to ensuring proper destroy, init,
- Minor fixes to edge cases with seting and retrieving internals/settings as default, init, or during run-time on some modules

### Version 0.5.1 - Oct 11, 2013

**Fixes**
- Fixes issue with modal sometimes closing/opening multiple times caused by changes in 0.5.0

**Updates**
- Fixes vertical alignment of checkboxes

### Version 0.5.0 - Oct 10, 2013

**Critical Fixes**
- Fixes in some UI modules, issue where settings being shared across elements initialized at the same time instead of each instance.
- Fixes regression where popup was overriding variation class name on positioning

**Fixes**
- Fixes an issue where popup that was set to inline: false was being removed prematurely
- Fixes inheritance issue where grid column may sometimes not appear the correct size
- Fixes modal hide/show dependency issue where dimmer would not always hide modal and vice-versa

**Updates**
- Adds an example to popup where inline is set to false
- Accordion now comes bundled with proper easing
- Added onCreate to popup module

### Version 0.4.3 - Oct 10, 2013

**Fixes**
- Updates dropdown to include proper invoke

### Version 0.4.2 - Oct 9, 2013

**Fixes**
- Fixes issue with event bubbling being cancelled on dropdown item click

### Version 0.4.1 - Oct 9, 2013

**Fixes**
- Fixes heart rating color

### Version 0.4.0 - Oct 8, 2013

**Updates**
- Updated some checkbox stylings
- Checkboxes markup now more semantic with default markup including only one label tag that can be inside ui checkbox

### Version 0.3.8 - Oct 8, 2013

**Fixes**
- Display issues with accordion

### Version 0.3.7 - Oct 8, 2013

**Fixes**
- Fixes modal show/hide action reversal in Webkit

**Updates**
- Dimmer can now take different durations for its show and hide

### Version 0.3.6 - Oct 7, 2013

**Fixes**
- Fixes popup position sometimes appearing off-stage on second apperance
- Fixes popup positions top left, top right, bottom left, bottom right being flipped

**Docs**
- Updates form and accordion docs

**Updates**
- Dropdown action default is now automatically determined based on type of dropdown, select dropdowns now will update form fields with default options
- Adds fluid variation to accordion
- Adds more html5 form support for forms (deneuxa)
- Fields can include both field and another level of fields

### Version 0.3.5 - Oct 2, 2013

**Fixes**
- Fixes radio checkboxes (again)
- Fixes header content display in icon headers

### Version 0.3.4 - Oct 2, 2013

**Fixes**
- Transitions now work in Safari versions that do not support animation-direction
- Fixes accordion in safari styles getting stuck
- Centering of content in icon header

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
