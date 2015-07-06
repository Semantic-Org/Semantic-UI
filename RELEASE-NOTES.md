## RELEASE NOTES

### Version 2.0.1 - June 30, 2015

**Reported Bugs**
- **Label** - Attached labels now use a border-radius for corner-edges that matches more closely [#2500](https://github.com/Semantic-Org/Semantic-UI/issues/2500)
- **Label** - Fixes incorrect label sizing for `large` and bigger sizes [#2486](https://github.com/Semantic-Org/Semantic-UI/issues/2486)
- **Segment** - Fixed incorrect margin set on `attached segment` [#2503](https://github.com/Semantic-Org/Semantic-UI/issues/2503)
- **Card** - `centered cards` variation now works similar to `centered card`. [#2520](https://github.com/Semantic-Org/Semantic-UI/issues/2520)
- **Checkbox** - Fixed issue in chrome where radio checkbox would appear incorrectly when no default value was selected [#2505](https://github.com/Semantic-Org/Semantic-UI/issues/2505)
- **Dropdown** - Fixed transparent tap color not being set correctly. Removed toggle behavior from touch events on multiple dropdown. [#2524](https://github.com/Semantic-Org/Semantic-UI/issues/2524)
- **Checkbox** - Fixed issue where radio checkbox were not properly receiving `checked` class [#2506](https://github.com/Semantic-Org/Semantic-UI/issues/2506)
- **Tab** - Tab now correctly obeys `cache` setting. Removed use of API's local caching by default. [#2493](https://github.com/Semantic-Org/Semantic-UI/issues/2493)
- **Form** - `reset` will no longer clear values if no default value is found [#2504](https://github.com/Semantic-Org/Semantic-UI/issues/2504)

**Additional Bugs**
- **Dimmer** - Dimmer now removes variations like `blurring` and `inverted` when `destroy` is called.
- **Dropdown** - `restore defaults` in dropdown when used with multiple will now correctly clear other values selected that were not there on page load.
- **Dropdown** - Removes accidental console.log statement in dropdown
- **Menu** - Fixed `pointing menu` arrow color slightly off
- **Progress** - Progress included `debug: true` by default. This has been now correctly set to `false`
- **Modal** - `scrolling modal` now correctly inherits rules so that it appears at top of screen on mobile
- **Menu** - Inverted menu no longer includes a 1px transparent border.
- **Menu** - Fixes `compact vertical menu` using `flex` style incorrectly
- **Menu** - Fixes `border-top` not appearing on `bottom fixed` menu
- **Tab** - Fixed bug where remote loaded tab content would not show `loading tab` on first load.

**Docs**
- **Form** - Clarified usage for `reset` in form docs [#2504](https://github.com/Semantic-Org/Semantic-UI/issues/2504)
- **Docs** - `1.0` docs are now available at [http://1.semantic-ui.com](http://1.semantic-ui.com) Link in footer has been fixed.
- **Image** - Fixed `mini image` having wrong pixel size in docs [#2521](https://github.com/Semantic-Org/Semantic-UI/issues/2521)
- **Image** - Added docs for missing `fluid image` variation
- **Modal** - Removed legacy JS animation settings still accidentally in docs
- **Tab** - Added new examples for `evaluateScripts` and HTML5 state tabs

### Version 2.0.0 - June 30, 2015

**Migration Guide**

- **Modal** - If you are using a modal with image content, you will need to use `image content` on the parent element. This is because `flex` rules require parent styling that the previous `table-row` rules did not.
- **Modal** - Modal will now only close on buttons matching `deny` or `approve` selector. Any button that should hide modal on click should either match one of these selectors, or call `$('.ui.modal').modal('hide')` `onclick`.
- **Grid** - `page grid` has been deprecated.  `page grids` used percentage gutters which made it unnecessarily difficult to style responsive page content. Moving forward we recommend using `ui container` a fixed width responsive container for holding page contents.
- **Dropdown** - Dropdowns will now change opening directions automatically based on available screen space. If you need  to force a dropdown direction use `dropdown({ direction: 'upward'})`
- **Form Validation** - Form validation now passes settings through a `fields` object. This is to make form initialization match other components. The previous syntax will continue to work but will produce deprecation notices in console
- **Checkbox** - Checkbox `fireOnInit` now defaults to false. Checkboxes now also *do not require javascript* to function.
- **Dropdown** - Dropdown item `description` now are floated in default theme and should be included before other `item` content
- **Form** - `grouped inline field` no longer display horizontally. Use `inline field` instead for horizontal inline field groups.
- **Input** - `pointer-events` have been removed from `icon` in `icon input` unless a `link icon` is used. This is to make sure the hitbox for focusing an input includes the icon.
- **Popup** - Popups are no longer exclusive by default. Opening a popup will not necessarily close other visible popups. You can change this behavior by using the setting `exclusive: true`. Additionally the default theme now uses `1rem` size for standard popups.
- **Colors** - Default colors have been adjusted, which may cause slight changes in your design. New colors have also been added to fill in missing gaps in [color naming](http://en.wikipedia.org/wiki/Linguistic_relativity_and_the_color_naming_debate#Berlin_and_Kay).
- **Segment** - Segment no longer includes a [clearfix](http://learnlayout.com/clearfix.html) by default. You will need to specify a `clearing segment` to clear floated content.
- **Rail** - Rail now uses `border-box` instead of `content-box`. This means manually specified rail widths will now need to account for padding. This was added to fix issues where rail `height: 100%` would incorrectly match content when a rail had padding.
- **Menu** - `tiered menu` has been removed in `2.0`. This may be rewritten in the future, but was not up to the standards of the rest of the library and has been removed.
- **Tab** - `onTabInit` and `onTabLoad` have been renamed to `onFirstLoad` and `onLoad` respectively. This is to conform to the naming conventions of other modules (no self reference). Previous callbacks will continue to work but will produce deprecation notices in console. Two new callbacks `onVisible` and `onRequest` have been added as well.
- **Button** - `wide` variations using numbers `2 wide`, `3 wide` have been removed due to incompatibilities with some build tools. Please use `two wide`, or `three wide` instead.
- **Video** - The undocumented `video` module has been renamed to `embed`. Behaviors remain the same, but users need to adjust their javascript init to `$('.ui.embed').embed();`
- **API** - API `onFailure` will now be called **in all failure conditions**, when a request is errored (504, 404 etc), aborted (page change or CORS), or JSON does not pass `successTest` function. `onError` and `onAbort` will also fire for each specific failure condition.

**New UI**
- **Container** - Containers are fixed width containers meant for holding page contents, and are a simpler alternative to `ui page grid`, view more [examples in docs](http://www.semantic-ui.com/elements/container.html#examples)
- **Multiselect** - New `multiple` dropdown types have been added. Many new dropdown improvements have been added including tagging/tokenizing features and loading data through API requests.
- **Embed** - New embed component allows for responsive iframe embeds that maintain their aspect ratio. Embed can be used with YouTube or Vimeo videos, along with placeholder content to avoid loading third party libraries until a user chooses to interact with the video.

**Major Enhancements (Please Read)**
- **Site** - Added new colors `olive`, `violet`, `brown` and `grey`. These are available in all elements with color variations.  **Thanks @lemartialou**
- **API** - API can now be used with mocked responses, and custom AJAX requests. `mockResponse` has been added to resolve request with a prespecified JSON object, or a synchronous function callback.
- **API** `mockResponseAsync` has been added for custom asynchronous requests. This allows you to specify a custom async callback to resolve an API request, helping with integration with libraries like Ember or Angular that may wrap AJAX requests.
- **API** - API callbacks now have an `onResponse` callback that can adjust a servers response before it is parsed by other callbacks for success or failure conditions. **Thanks @mnquintana**
- **API** - API now provides a local caching setting to avoid server roundtrips for identical urls by using `cache: 'local'`. This is not enabled by default.  Local caching is useful for results that should return the same values across a single session, for example when querying an autocomplete.
- **Card** - Cards now support multiple custom `content` blocks. Content blocks and images can now appear in any order.
- **Checkbox** - Checkbox no longer require javascript to function.
- **Checkbox** - Added support for `indeterminate` checkboxes, along with new stylings.
- **Checkbox** - Now includes separate behaviors for triggering state changes without invoking callbacks `set checked` vs `checked`
- **Dropdown** - Added remote API integration with dropdown, to allow `search selection` to query against a remote dataset.
- **Dimmer** - Dimmers now have a `blurring` variation which apply a glass-like effect when dimmed
- **Dropdown** - Dropdowns now automatically observe changes in `menu` and will update selector cache with new additions
- **Dropdowns** - Added ability to add custom choices to all search selection dropdowns (multi/single) using `allowAdditions: true` setting. Search now displays error messages on no results in all cases.
- **Dropdown** - Keyboard shortcuts have been added for selecting dropdown choices, for example "N" will scroll to "New York" in a state selection list, similar to native `<select>` behavior.
- **Dropdown** - Added new dropdown variation `scrolling dropdown` and `scrolling menu`, this can be used to include a scrollable section inside a dropdown menu.
- **Dropdown** - Dropdown will automatically animate upward if there is not enough space to appear below.
- **Dropdown** - Using `page up` and `page down` keys will now scroll menus by a page at a time
- **Form** - Forms now use `flexbox` for creating field groups. Inline fields now support `(x) wide` sizing using `flex`
- **Grid** - Grids now use `flexbox`, columns are now all equal height by default. New flexbox alignment types like `stretch` have been added for easier vertical alignment.
- **Multiple UI** - Many components now use flexbox, which means previous confusing fixes like `font-size: 0;` to remove [white-space from inline block](https://css-tricks.com/fighting-the-space-between-inline-block-elements/) is no longer necessary. Removing this hack, now means any element can be a direct child of `grid` or `menu`.
- **Modal** - Added new settings `blurring` and `inverted` which automatically set a modal's dimmer to either inverted or blurring.
- **Menu** - Menu now uses flexbox. This allows menu items to match each others heights regardless of each items content size. `right menu` content should now follow other menu content instead of preceding it (no longer uses float).
- **Grid** - Grids are now `flexbox` and `equal height` by default, the `equal height` variation can safely be removed
- **Popup** - Popup has been rewritten to drastically improve performance, especially when testing multiple positions.
- **Transition** - Fallback javascript animations have been removed from UI components like dropdown and popup to increase performance. This removes need for expensive pseudo selectors like `:visible`, `:animated` and `:hidden` and reduces filesize.
- **Form Validation** - Form validation now uses a single `settings` object like other modules. Using `(fields, settings)` will continue to work but will produce a deprecation notifications in `console`
- **Form Validation** - Form validation now supports many new validation rules, including some specifically for use with multiple select values.
- **Item** - Items now uses `flexbox` for layout.
- **Message** - `icon message` now uses `flexbox` for layout
- **Menu** - `vertical tabular menu`, a vertical tab menu, has been added
- **Input** - All `input` types use `flexbox` for layout
- **Segment** - Segments now support complex nesting, many new rules for how segment groups should appear inside groups
- **Segment** - New `horizontal segment` groups make laying out auto resizing text columns much easier.
- **Sidebar** - iOS will now correctly report `scrollTop` values for `document` or `body` when using a sidebar. Chrome on iOS no longer has issues with fixed content not sticking immediately when using a sidebar.
- **Shapes** - Shapes now correctly adjusts for margin on `sides`
- **Steps** - Steps now use `flexbox`, fluid steps now center content inside each step
- **Steps** - Steps no longer need `item count` and will automatically divide evenly
- **Transition** - Transition code has been optimized to increase performance. 100% improvement on first animation, and 40% improvement on subsequent animations.
- **Visibility** - Using `.visibility({ type: 'fixed'})` will now automatically add a placeholder element which will swap places with an element when it is attached to the viewport. This should make fixed content drastically simpler.
- **Visibility** - Visibility and sticky now use a more performant [pub/sub pattern](http://davidwalsh.name/pubsub-javascript) that will only attach a single event to context `scroll`.
- **Visibility** - Added two new visibility callbacks `onOnScreen` and `onOffScreen`, which occur, most obviously when an element first appears in or out of a browser's viewport.

**Enhancements**
- **Site** - Added many new site variables, including the ability to control input size across all UI `inputPadding`, along with more border colors, accents, and colors.
- **Accordion** - adds `onOpening` and `onClosing` callback (before animation) to go with `onOpen`, `onClose` (after animation) **Thanks @cluppric**
- **Accordion** - Added `on` setting for specifying accordion trigger event.
- **Activity Feed** - Activity feed has been rewritten to use `flexbox`
- **API** - API now has new settings `throttleFirstRequest` and `interruptRequests`. Interrupt requests will abort a previous request on an element when making a new request. `throttleFirstRequest`, sets whether the first request or only subsequent requests should be throttled when a `throttle` duration is specified.
- **Build Tools** - Build tools will now display pre-specified errors when a theme file is missing or an element specifies an unavailable theme.
- **Build Tools** - Adjusting `site.variables` will now rebuild all UI, instead of just `site.less`
- **Button** - Added `:focus` styles for all button types, all button examples in docs now are keyboard focusable using either `<button>` or `tabindex` where appropriate.
- **Card** - Card now includes a `centered` variation
- **Checkbox** - Checkbox will now gracefully correct behaviors invoked on the child input element instead of the `ui checkbox`.
- **Checkbox** - Reduced kb size of icon font
- **Divider** - `vertical divider` inside `ui grid` now accounts for column padding
- **Dropdown** - Nested `scrolling` menus now support keyboard selection, e.g. pressing "A" for apple, and keyboard scrolling.
- **Dropdown** - Dropdowns now have `match` setting to specify whether to match on `text`, `value` or `both`
- **Dropdown** - Multi select dropdowns now have new settings for specifying maximum selection count
- **Dropdown** - Dropdown has new `placeholder` setting for setting placeholder text in javascript
- **Dropdown** - Added `showOnFocus` option that lets you specify whether dropdown menu should show on focus
- **Dropdown** - `fullTextSearch: true` now uses fuzzy search (same as `ui search`)
- **Dropdown** - Page down and page up now works with dropdown menus
- **Dropdown** - Dropdown initialized with `disabled` prop on an `option` will now correctly appear disabled
- **Dropdown** - Added `disabled item` state, disabled items will automatically be skipped with keyboard selection
- **Form** - Added a host of new styles for form fields autocompleted by your browser, including autocompleted error, and focus states
- **Form** - Added placeholder color rules for IE, `ms-input-placeholder`
- **Form** - Fix `errored field` dropdown keyboard selection color
- **Form** - Adds form `success` state
- **Form Validation** - Added `is valid` behavior, returns `true/false` if form is valid
- **Form Validation** - Added `different[field]` rule which requires a field to be different than another field
- **Form Validation** - `data-validate` now takes precedence over other validation matching schemes like `name` or `id`
- **Form Validation** - New rules for matching against custom regular expressions
- **Form Validation** - Form validation now has `minCount`, `maxCount`, and `exactCount` for validating multiple selections
- **Grid** - `celled grid` now removes internal cells on mobile and tablet when used with `doubling` grid responsive variation.
- **Grid** - Added `large screen only` and `widescreen only` responsive variations for grid.
- **Grid** - `equal width` grids now works without `row` wrappers
- **Grid** - rows can now be `stretched` as well as `middle aligned`, `bottom aligned` and `top aligned`!
- **Grid** - Fixed margins on `internally celled` grid
- **Grid** - `celled` and `internally celled` grid now use flexbox instead of `display: table;`
- **Headers** - Added new header type `sub header`, useful for displaying small headers alongside text content. See examples [in the header docs](http://www.semantic-ui.com/elements/header.html#sub-headers)
- **Image** - Images now include a `spaced` variation for adding whitespace around images when used inline with text.
- **Input** - Added placeholder color rules for IE, `ms-input-placeholder`
- **Input** - Action input now supports multiple buttons, and dropdown
- **Label** - Labels now have `active` and `active hover` states
- **Label** - Label now sets an `img` height even when not using an `image label`
- **List** - Any content inside a `ui list` can now be vertically aligned
- **Menu** - Add examples/documentation for `fixed menu`
- **Menu** - Added `stackable` menu variation for simple responsive menus
- **Menu** - Added many new variables to menu
- **Menu** - Fixed several inheritance issues for `dropdown item` inside `menu` appearing as `menu item`.
- **Menu** - Horizontal menus now set a default image size for images / logos
- **Menu** - Menus items are now slightly more padded
- **Menu** - The hover/active state of `dropdown item` have been adjusted to match `item`. Dropdown styles can be themed specifically inside `menu`.
- **Menu** - Vertical dropdown menus are no longer 100% `min-width`
- **Modal** - Modal now uses an adjusted `scale in` transition in the default theme, that should be more subtle and work better with long modal content.
- **Modal** - Modal `onApprove` and `onDeny` now receive the activating element as the first parameter. Added documentation about using `return false` to avoid hiding element on click.
- **Modal** - Modal content now uses flex, image content now requires `image content` class on parent to allow for flex stylings.
- **Popup** - Popup now defines a `transform-origin` so animations will be affected by the direction the element is placed
- **Popup** - `onShow` and `onHide` callback can now cancel popup from showing or hiding by returning false
- **Popup** - Added more size variations for popup `mini`, `tiny`
- **Progress** - `indicating` labels now are more legible use separate css variables from `indicating` bar color
- **Reveal** - Added new `active` state that allows you to show `reveal` programatically
- **Search** - Cache can now be cleared using `$('.search').search('clear cache')`
- **Segment** - Added `padded` and `very padded` segment variations
- **Search** - Search now operates off a unique id generated by result position to retrieve results. For example category #1's first result is 'A1' . Previously result titles were used as their "id", which could cause issues with duplicate titles, or results that do not contain a title.
- **Search** - Search will now automatically add class `category` when using `type: category`.
- **Search** - Search will now generate `results` container if one is not present on init
- **Search** - Search now uses `em` for resizes, making sure it will resize with the surrounding content
- **Search** - Search `prompt` now has focus styles defined if not using `ui input`
- **Segment** - Added `clearing` segment for cases that need a [clearfix](http://learnlayout.com/clearfix.html).
- **Sidebar** - Improved animation performance through performance debugging. Sidebar now caches, width, height, rtl direction on load.
- **Site** - Fixed mixed globals `@defaultDuration` and `@transitionDuration` usage to use a single variable across all UI `@defaultDuration`, the same for `@defaultEasing` and `@transitionEasing`
- **Site** - Added in `pageOverflowX` variable, default theme hides horizontal scrollbars on `body`
- **Site** - Added default `focus` colors for all color variations
- **Site** - All floating/raised variations now inherit from a global `@floatedShadow` making theming easier
- **Sticky** - Sticky now internally caches current scroll position when `cantFit = true` to avoid getting DOM property  on scroll.
- **Statistic** - Added new evenly divided group variation, for example `three statistics` shows 3 per row
- **Statistic** - Statitic group now use `flex`. Styles have been updated.
- **Steps** - Added `attached` steps, which can now be attached to other UI like `segment`
- **Tabs** - Tab will now manually correct page scroll position when linking to an in-page anchor in a hidden tab
- **Tabs** - Added new callbacks `onTabVisible` and `onRequest`
- **Tabs** - Added `parseScripts` option, defaults to `once` parsing inline scripts only first load
- **Table** - Adds `selectable table` variation, which shows hover effect on row when hovering
- **Table** - Added `vertical alignment` variations to `ui table`
- **Table** - Added `single line` table variation which prevents text from wrapping
- **Transition** - Adjusting `style` or `class` during a transition, will no longer reset the change after transition completes.
- **Transition** - Transition will no longer force visible/hidden with inline styles if `onComplete` callback sets visibility.
- **Visibility/Sticky** - Visibility and sticky now refresh automatically after page content loading to deal with changes in position from images loading
- **Visibility/Sticky** - Visibility now uses pub/sub pattern to greatly improve scroll performance when attaching multiple events
- **Visibility** - Visiblity includes a new setting `checkOnRefresh` which detemrines whether visibility callbacks should occur on resize or refresh
- **Visibility** - Visibility `image` will now wait to lazy load images that are *above* the current screen position, not just below.

**Bugs**
- **All Modules** - Performance logging now delays 500ms instead of 100ms for console logging to ensure all logs are captured in one group
- **All Modules/Transition** - Transitions no longer use `rotateZ(0deg)` to trigger GPU display of visible state. This causes issues with `transform` creating new stacking context that can disrupt `z-index`.
- **Accordion** - Fixed bug where `exclusive: true` could sometimes cause other accordion element animations to get stuck when animating rapidly
- **API** - API longer uses `readyState = 0` as sole check for request abort, this may accidentally trigger with `JSONP` or `CORS` requests.
- **API** - Fixed `this` context of `beforeSend` to use `stateContext` not `element`
- **API** - Fixed `loadingDuration` not correctly delaying requests when invoking with  `.api('query')`
- **Build Tools** - Fixes issue with out of date minify dependency causing rules with `background: inherit;` to be removed.
- **Button** - Fixed `attached buttons` 1px offset when attached to segment and menu (border vs box shadow border)
- **Card** - IE11 now can correctly use  `flexbox` cards **THanks @Widcket**
- **Checkbox** - Fix `disabled checkbox` sometimes displaying hand cursor
- **Checkbox** - Fixes nested `dropdown` inside `checkbox` causing issues
- **Checkbox** - Fix `:focus` styles only applying if checkbox is unchecked
- **Divider**  - Hidden divider now correctly hides vertical dividers
- **Divider** - Fixes single icon alignment inside `vertical divider` or `horizontal divider`
- **Divider** - Fixed slight offset in `vertical divider` when it automatically adjusts to `horizontal divider` inside a `stackable grid`
- **Dropdown** - `focus` after changing tabs will no longer cause menu to re-open **Thanks @trevorharwell**
- **Dropdown** - Fix issue with search dropdown refocusing on self the first time after "tabbing" away in Chrome
- **Dropdown** - Fixes issue with headers disappearing inside of `ui dropdown` when nested in `ui menu`
- **Dropdown** - Fixes `onChange` to fire when input value changes, not just when menu UI changes
- **Dropdown** - Dropdowns with `transition: none` now work correctly.
- **Dropdown** - Fixed issue where `sortSelect` was relying on object key enumeration order which is browser dependent and unreliable. It now uses a sort function which functions the same in all browsers
- **Dropdown** - Fixed issue with `search selection` not changing text when reselecting same value from list
- **Dropdown** - Fixed `min-width` issues causing background to not appear behind unwrapped text with `white-space: nowrap`
- **Dropdown** - Dropdown `menu` now use same font size as dropdown
- **Dropdown** - Fixed dropdown `metadata` attribute caching causing issues with React integration
- **Dropdown** - Fixed border radius on `sub menu` when aligned `left`
- **Dropdown** - Fixed `inline dropdown` icon not aligning with content
- **Dropdown** - Fixed behaviors called on `<select>` after initialization not being correctly applied to `ui dropdown`
- **Dropdown** - Fixed issue with matching boolean values, and using `set selected` with `true` or `false`
- **Dropdown** - Fixed `search dropdown` submitting parent form when enter shortcut pressed
- **Dropdown** - Fixed dropdown menu items should not center inside of a center aligned container.
- **Dropdown** - Fixed some cases where onChange would not occur for values matching equality against '', for example `0`
- **Form** - Form will no longer set a height for `textarea` using the `rows` property
- **Form** - `inline fields` are now `1em` and do not match label's reduced size
- **Form** - `field` inside `fields` no longer produce double sized margins.
- **Form** - Form sizes and input sizes now inherit from `site.variables`
- **Form Validation** - Fixed bug causing `match` rule not to work as expected.
- **Form Validation** - Fixed `clear` and `reset` causing validation error to appear on checkbox if empty rule was set on checkbox.
- **Form Validation** - Form validation now validates correctly on `<select>` change
- **Form** - Fixed autocompleted `ui selection dropdown` having dropdown icon z-index issues
- **Form/Input** - `ui labeled input` inside `form` will no longer escape column width. `ui fluid input` will now use input widths shorter than browser default.
- **Grid** - Fixed responsive styling for grid types, more consistent display for `divided`, `celled,` on mobile
- **Grid** - Fix `doubling row` not working correctly inside a different `doubling grid` (css spec issue)
- **Grid** - Fix `doubling grid` incorrectly applying width to `(x) column row`
- **Grid** - First column on `stackable grid` no longer receives top margin
- **Grid** - `x column wide` inside `equal width/height` now cannot grow beyond column size
- **Grid** - Fixes colored grid columns not appearing when not nested in rows
- **Icon** - Fixes `ascending` and `descending` icon being swapped
- **Icon** - Fixes phone icon only appearing as alias `call`
- **Image** - `rounded image` and `circular image` now apply border radius to all child elements, fixing dimmers, and other content rounding
- **Input** - Fixed improper left padding on `transparent left icon input` **Thanks @zxfwinder**
- **Input** - Fixed `placeholder` color not changing correctly on focus **Thanks @zxfwinder**
- **Input** - Fixed right padding on `labeled input` that were not `corner labeled`
- **Label** - Labels inside `header` now vertical align better by accounting for line height offset
- **List** - `horizontal list` are now aligned `middle` by default, while vertical lists are aligned `top`.
- **List** - Fixes numbers not appearing when using `inverted ordered list` **Thanks @pcj**
- **List** - `a` elements inside a `ui list` will no longer apply styles on `ui` elements like `button` **Thanks @ahtinurme**
- **List** - Fixed `divided bulleted list` child lists getting wrong indent
- **List** - Bullets and numbers are no longer selectable in `bulleted list` and `ordered list`
- **List** - Fixed `inverted bulleted list` bullet color
- **List** - Fix first element touches border on `ui horizontal celled list`
- **List** - Added many new variables for link stylings inside list, added separate variables and defaults for child-list spacing
- **Loader** - Fix position of `inline centered loader` to be centered correctly
- **Message** - Message now uses `@lineHeight` from `site.variables`
- **Menu** - Fixed menus like `left fixed` `right fixed` are all now class order dependent.
- **Menu** - Fixed 1px border on last element of inline menus like `pagination menu` or `compact menu`
- **Modal** - Modal no longer hides page scroll bar causing dimmed page content to jump positions.
- **Modal** - Fixed bug where clicking an element detached from dom would cause modal to hide prematurely
- **Modal** - Clicking on other modals will no longer close open modal when `allowMultiple: true`
- **Modal** - Fixed `scrolling` class not being removed after opening a normal modal after a `scrolling` modal.
- **Message** - Updated all message colors for legibility
- **Message** - Close icon position adjusted to align with headers
- **Menu** - Fixes divider appears on last element of `(x) item menu`
- **Menu** - Fixed `top attached menu` not having margin-top, and `bottom attached menu` not having `margin-bottom`
- **Menu** - Menu now has a `min-height` that matches standard item padding
- **Menu** - `dropdown menu` in a `secondary pointing menu` or `tabular menu` now receive distinct active styling from other `active item`
- **Menu** - Fixed arrow position in `pointing menu` to be more consistent, round to exact pixels and account for arrow border width
- **Menu** - Fix issue with `pointing` arrow having too high a `z-index` and appearing above `ui dropdown menu`
- **Modal** - `scrollable modal` now correctly adds padding below modal
- **Modal** - Modal with `detachable: false` inside `ui sidebar`  `pusher` element will now show correctly
- **Popup** - Popup now correctly adjusts if `data` attributes change
- **Popup** - Fixes issue with `min-width` in firefox exceeding `max-width` causing element to not wrap correctly
- **Popup** - Popup will now produce an error message and not mistakenly appear in the top left corner of page, if called with a `popup` or `target` that does not exist.
- **Popup** - Popup will no longer appear incorrectly if the targeted element is not visible on page
- **Popup** - Fixed bug which could cause pre-existing inline popup to be removed from DOM after hiding
- **Popup** - Fixes popup offstage position calculations with pages including horizontal scrollbars
- **Popup** - Added `addTouchEvents` to specify whether touch events should be added to trigger popup on mobile
- **Progress** - Fixed bug where percentage complete values between 0-1% would display incorrectly (0.5% would show as 50%)
- **Rail** - Rail 100% height now uses `border-box` to ensure exact height match to container
- **Rating** - Rating now correctly adjusts if `data` attributes change
- **Reveal** - Removed `masked` reveal, all reveals are masked by default
- **RTL** - Fixed `rtl: 'both'` in `semantic.json` not building both versions of source correctly.
- **Search** - Search will no longer incorrectly produce an error when API settings are passed through metadata
- **Sidebar** - Top/Bottom sidebar will now show scroll bars correctly when taller than 100% page height
- **Sidebar** - Fixed bug where having a `style[title]` in page causing page not to be pushed correctly
- **Sidebar** - Last menu item now has a border when sidebar and menu are used together
- **Segment** - Segment groups can now be `raised` or `piled` or `stacked`
- **Search** - Fixed `category search` not applying active styles correctly to category names
- **Search** - Fixed `onSelect` not returning the correct value when using `type: category`
- **Search** - Fixed `onSelect` returning the first term that matches the beginining of the selected value not the exact value.
- **Search** - Fix `loading search` with an `icon button` causing double loaders.
- **Search** - `searchFields` setting now correctly replaces default fields instead of adding the user fields to defaults
- **Search** - Calls to `set value` or `query` now obey `minCharacterLength`
- **Search** - Search API calls now use the same level debug settings as search
- **Steps** - Fixes bug where `ordered steps` had smaller numbers in `IE10`
- **Steps** - Fixed bug where `stackable steps` were not working correctly
- **Sticky** - Fix issue with sticky content scroll css transition causing element to scroll too slowly when cannot fit on screen.
- **Sticky** - Fix issues when `pushing: true` with sticky content having incorrect bottom spacing, when container has bottom padding
- **Sticky** - Fixed issue with sticky content animating width on display in some cases.
- **Tab** - multiple tab groups initialized together with `context: 'parent'` will now each use their own parent
- **Tab** - Tabs now use the standard component design pattern internally
- **Table** - Fixes `sorted` column are not correctly centered with `center aligned` due to margin on sort icon
- **Table** - Fixes `ascending` and `descending` icons were reversed in table
- **Table** - `very basic table` now works together with `padded table`
- **Table** - Fix inheritance of text alignment and vertical alignment
- **Transition** - Fixed bug where transition out would cause unwanted focus event in IE if element has focus
- **Transition** - Calling an `out` animation during an `in` animation with `queue: false` now correctly calls the `complete` event of the original animation
- **Transition** - Fixed bug where transition could sometimes not occur when an element was determined to always be hidden

**Changes**
- **All Modules** - All modules now default to `verbose: false`
- **Accordion** - Accordion no longer sets a `font-size` to better couple with other components defaults
- **Button** - Button focus color now uses hoverColor background instead of blue box shadow
- **Button** - `basic colored button` now grow their border size to 2px in default theme on hover
- **Breadcrumb** - Fixed breadcrumb `em` rounding, adjusted distance in default theme
- **Card** - Card styles have been adjusted, `link card` now raise to show selection. Colored variations now have shadows.
- **Checkbox** - Toggle now uses `@primaryColor`
- **Dropdown** - Dropdown padding values now resolve to exact pixel values from em
- **Dropdown** - `item` `description` is now floated by default
- **Feed** - Removed `extra text` pointer border
- **Form** - `set value` no longer automatically calls `validate form`
- **Grid** - Small computer `page grid` gutters have been adjusted from 8% to 3% to allow for roomier layouts on small screens.
- **Grid** - Vertically divided grids now double row spacing to account for dividers
- **Grid** - `center aligned` no longer centers rows, just text. Use `centered grid` to center a grid column on the page.
- **Header/Table/Divider** - These components now pull border color defaults from `site.variables` instead of using their own values
- **Image** - `avatar image` size has been slightly decreased
- **Image** - `mini image` default width has been increased to `35px`
- **Item** - item `description` now longer sets a `max-width`
- **Icon** - `disabled icon` now have `pointer-events` again.
- **Label** - Label size now varies by type. `pointing label` are now `1em` by default.
- **Label** - Padding on `corner label` has been increased
- **Input** - Input now use `em` instead of `rem` so they will inherit the size of the elements they are nested inside
- **Progress** - Update contrast on `indicating`, update default styles. Fixed some examples
- **Menu** - Menu now uses `border` for borders instead of `box-shadow`
- **Menu** - `secondary pointing menu` has had some slight design tweaks, thinner lines, more padding
- **Menu** - Active sub-menu items are now `bold`
- **Menu** - Menus no longer have additional borders on `active item` in the default theme
- **Menu** - `tiered menu` has been removed
- **Menu** - Increased contrast on `inverted` menu selection for legibility
- **Modal** - Modals now used fixed widths and not percentage widths. Widths might be slightly different.
- **Modal** - Modal no longer observes DOM changes by default, added setting to enable
- **Message** - Slightly increases `box-shadow`
- **Popup** - Popups now default to `exclusive: false` and will not hide other popups when opening
- **Popup** - Popup no longer produces a console error when a position cannot be found on the page.
- **Rating** - Rating styles have been adjusted to use subtle transitions and tweaked color values.
- **Segment** - **Clearfix** has been removed from `ui segment`
- **Sidebar** - Sidebar `legacy` animations have been removed. 3D transforms are now available in all supported browsers.
- **Search** - Slightly adjusted search result theme for clarity
- **Segment** - Segment now uses `border` for border instead of a second `box-shadow`, this may adjust position by 1pixel
- **Statistic** - Statistic label styles have been updated
- **Site** - Additional font variables have been added to site to help clarify variable purpose.
- **Site** - Increase contrast on default hovered/down colors for colored variations
- **Site** - Page background is now `#FFFFFF` by default instead of an offwhite `#F7F7F7`
- **Site** - Adjusted global line height to the closest even pixel value
- **Table** - Table header colors and padding defaults have been slightly adjusted
- **Table** - Horizontal cell padding has been slightly reduced, and cell borders are slightly lighter.
- **Transition** - Transition no longer checks for vendor prefixed `animation-name` css property. This was introduced in jQuery `1.8`
- **Transition** - Some transition have been modified so that the `in` animation is more telegraphed than the `out` animation, which may now recede more gently.
- **Visibility** - In returned `calculations` object, `visible` and `hidden` are renamed to `onScreen` and `offScreen`, since this describes more accurately what the value represents.

### Version 1.12.3 - May 20, 2015

**Announcement**
Version 2.0 will be launching on June 1st, which will include 100+ bug fixes, enhancements, new ui, and default theme improvements.

**Bugs**
- **Grid** - Fixes bug causing colored variations not to work on columns without row wrappers. Backport from `2.x`

### Version 1.12.2 - May 4, 2015

**Bugs**
- **Dropdown** - Fixed `left` and `right` arrow does not move input cursor with `visible selection dropdown`. Event accidentally prevented by `sub menu` shortcut keys.

### Version 1.12.1 - April 26, 2015

**Bugs**
- **Dropdown** - Fixes issue with chained dropdown methods used on a `<select>` not applying to the generated `ui dropdown` **Backport from 2.0**
- **Input** - Fixes labeled inputs not adjusting correctly with flex. **Backported from 2.0**
- **Input** - Fixes placeholder text color prefixes for `webkit` **Backport from 2.0**
- **Progress* - Fixes rounding error in precision settings *Thanks @aaroncox*
- **Popup** - Removes `min-width: moz-max-content` from popups, which may cause display differences between chrome and FF

### Version 1.12.0 - April 13, 2015

**Enhancements**
- **Visibility** - Adds updated visibility module from `2.x` channel. Visibility will automatically refresh by default after images load on page refresh. Fixes issues with element positions after image loading.
- **Sticky** - Adds sticky module from `2.x` branch. Sticky elements now use pub/sub with drastically improved performance. Sticky elements that do not fit on page will now scroll at the same speed as the page is scrolled instead of slower.

**Changes**
- **Popup** - Popup no longer produces a console error when it cannot find an adequate position in the browser viewport.

**Bugs**
- **Build Tools** - Fixes issue with component glob matching twice (causing build to include file twice) if duplicate values found in `semantic.json` component.
- **Input** - Backports fix from `2.x` for `ui fluid input` not appearing correctly.
- **Visibility** - Fixed issue where `precache` behavior was missing from visibility causing `image` lazy loading to fail

### Version 1.11.8 - April 13, 2015

**Bugs**
- **Build Tools** - Fixed `npm install` without `semantic.json` to merge changes with site theme and packaged themes in a similar fashion to `npm update`
- **Build** - `gulp build` now properly warns against missing `semantic.json` **Thanks @rudyrk**

### Version 1.11.7 - April 13, 2015

**Bugs**

- **Sticky** - Fixes errant `console.log` statement appearing in source
- **Card** - Fixes card `flex` display issues in IE
- **Build Tools** - Fixes issue where `npm update` install scripts would remove custom themes from `src/themes/` during copy after updating Semantic UI

### Version 1.11.6 - March 27, 2015

More critical bug backports from `2.x` branch, as well as fixes for browserify

**Bugs**
- **Menu/Dropdown** - Fix dropdown headers disappearing inside menus
- **Dropdown** - Fix unescaped character in css property causing css validation errors
- **Form** - Fix `grouped required` fields display issues **Thanks @palmsey**
- **All UI** - Fix `index.js` npm build to work with browserify in individual component repos **Thanks @sdimit**
- **LESS Repo** - Add missing `semantic.less` file to less repo for importing components

### Version 1.11.5 - March 23, 2015

This version backports several bugs that were being packed in `2.0` to `1.x`.
2.0 will be coming in the next 1-2 weeks.

**Bugs**
- **Build Tools** - Adjusting site.variables will now rebuild all UI, instead of just site.less
- **Build Tools** - LESS will now throw errors correctly in `watch`
- **Card** - Fixes dimmer background shorthand property causes transparent dimmer in minified version
- **Dimmer** - Fixed `variation` setting not working correctly
- **Dropdown** - `onChange` no longer fires when reselecting same value
- **Dropdown** - Fix bug where element will not blur on tab key when search selection and no selection made
- **Dropdown** - Dropdown init on `select` now returns `ui dropdown` created for chaining
- **Dropdown** - Dropdown `focus` color has been adjusted to match forms more closely
- **Dropdown** - Fixes IE10 scrollbar width in menu (calc was being precompiled in LESS) **Thanks @gabormeszoly**

### Version 1.11.3-4 - March 6, 2015

**Enhancements**
- **Grid** - Added opt-in `stretched` variation for `equal height` instead of forcing `flex` on all `equal height columns` which may cause layout issues due to changes in rendering with `flexbox`.

**Fixes**
- **Build Tools** - Fix issues with minified CSS `@import` not being on top of minified semantic ui concatenated release due to [bug in clean-css](https://github.com/jakubpawlowicz/clean-css/issues/476)
- **Grid** - Fixes `stackable` `equal height/width` grid to remove `flex` on mobile when stacking
- **Grid** - Fixed `right/left/center aligned` to adjust `align-items` in flex containers like `equal height/width`

### Version 1.11.2 - March 6, 2015

**Enhancements**
- **Accordion** - Accordion can now specify a trigger element instead of `title`, added an [example in docs](http://www.semantic-ui.com/modules/accordion.html#changing-trigger)
- **Accordion** - Accordion can now hide while opening animation is still occurring
- **Grid** - Equal width grids will now make column content stretch to full height, not just the column itself (requires flexbox). See examples [in the grid docs](http://www.semantic-ui.com/collections/grid.html#equal-height)
- **Header** - Labels inside headers have been slightly increased in size
- **Search** - Search now uses internally [fuzzy search](https://github.com/bevacqua/fuzzysearch) as its new full text search algorithm.

**Important Fixes**
- **Build Tools** - Fix issues with minified component CSS `@import` not always being on top of files due to [bug in clean-css](https://github.com/jakubpawlowicz/clean-css/issues/476)

**Bugs**
- **Accordion** - Removed mistaken extra `1px` top border on nested `styled accordion`
- **Modal** - Fixes modal `buttons` on mobile devices to not have extra bottom padding.
- **Card/Dimmer** - Fix dimmer z-index being too high when inside a `ui card`. Added variable for specifying default dimmer color inside card.
- **Site** - `h1-h5` now have no top margin when `first-child` and no bottom margin when `last-child`
- **Dropdown** - Fix issue in `setup reference` (added in `1.11.1`) where chaining would not return `ui dropdown` immediately after initialization

### Version 1.11.1 - March 5, 2015

**Enhancements**
- **Dropdown** - Calling behaviors on a dropdown `select` will now automatically route them to the appropriate parent `ui dropdown`

**Bugs**

- **Grid** - Fix issue in `centered grid` not centering `column` inside `row`
- **Dropdown** - Added select styles for elements before they are initialized instead of FOIC (Flash of invisible content)

### Version 1.11.0 - March 3, 2015

**New Components**
- **Visibiliity** - Attach callbacks to elements visibility conditions like `top visible` `bottom visible`, `passing`. Useful for things like: image lazy loading, infinite scroll content, and recording tracking metrics.

[See the examples](http://www.semantic-ui.com/behaviors/visibility.html#/examples) online for a demonstration.

**Enhancements**
- **Menu** - Horizontal menus now use flexbox so they can resize automatically to content size.
- **Form** - `<select>` now receive error formatting on `form error` **Thanks @davialexandre**
- **Transition** - Added more reasonable default durations for each animation
- **Loader** - `inline loader` now has a `centered` variation
- **Modal** - Modal no longer hides and reshows dimmer when opening a modal with another modal open with `exclusive: true`
- **Popup** - Added `exclusive` parameter to automatically close other popups on open
- **Transition** - Added `toggle` behavior and docs for `show` and `hide`
- **Transition** - transition now has `stop`, `stop all`, and `clear queue` for removing transitions, (undocumented method `stop`, and `start` renamed to `enable` and `disable`)
- **Dimmer** - Add `opacity` setting to override css value. Add to docs several undocumented settings, like `useCSS`, and `variation`.
- **Icon** - added `@src` variable to make it adjustable with themes that dont support all types like `woff2`

**Deprecations**
- **Menu** - `ui tiered menu` has been deprecated. It has been removed from the docs, and will be removed eventually in `2.0`

**Bugs**
- **Input** - Fix bug with vertical centering of `ui action input` inside `menu` due to `flexbox` changes
- **Dropdown** - Fixes issue where dropdown would not open after restoring previus value on failed `search dropdown` search
- **Dropdown** - Fixes issue where dropdown would not open after restoring previous value on failed `search dropdown` search
- **Grid** - Fixes specificity of grid `column` colors to not affect other elements with columns
- **Icon** - Fix `clockwise rotated icon` causing `clockwise` icon to appear
- **Popup** - Fix issue with `popup` not re-opening until another element gains focus on a mobile touchscreen
- **Modal** - Fixed issue with modal not appearing when calling `show` during another modal `hide`
- **Popup** - Popup will now fire `onHidden` when an element is hidden by opening a different popup
- **Popup** - Fix popup not namespacing `window` events and unbinding on `destroy` **Thanks @revov**
- **Table** - Fixes table on `mobile` sizes can surpass parent container width
- **Transition** - Fixes `swing out` animations not working correctly
- **Transition** - Fixed display state other than `block` not determined when using `show` and `hide` without an animation
- **Transition** - Fix bug in `remove looping` causing next animation to use same duration
- **Segment** - Fix first/last margins on `ui segments`
- **Search** - Fix special characters not searching correctly with local search
- **Search** - Fix a bug with `onSelect` returning `null` when `minCharacters: 0`
- **Search** - Fix a bug with `onSelect returning `null` when results retrieved from cached API query
- **Sticky** - Fixed sticky position when page loads and content is below sticky content.
- **Sticky** - Fix bottom attached position not adjusting for bottom padding on container element
- **Menu** - Fix vertical pointing menu, sub menu arrow color
- **Item ** - `img` inside of `ui item content` now do not receive size formatting by default
- **Form** - Added `input[type="search"]` styles to `ui form`

**Docs**
- **Transition** - Adds examples of `hide, `show`, `toggle`, `stop`, `stop all`, and `clear queue`
- **Item** - Significant rewrite of `ui item` documentation

### Version 1.10.4 - February 28, 2015

- **API** - Remove console error message when no API url is specified but element is a `form` (defaults to `form` action)
- **API** - `api` check for [serialize object](https://github.com/macek/jquery-serialize-object) optional dependency no longer produces error when `serializeForm: true` and dependency is not found.

### Version 1.10.3 - February 27, 2015

**Bugs**
- **Build Tools** - All UI components now have component name in comment banners and release version
- **Menu** - Fixes dropdown menu item not having a hover state inside inverted menu
- **Search** - Fixes bug in category search causing item selection to sometimes produce a javascript error.
- **Button** - Fixes `<button>` inside `vertical buttons` not taking full container width

### Version 1.10.1-2 - February 24, 2015

No changes, fixes stale pm component builds

### Version 1.10.0 - February 23, 2015

**New Features**
- **Transition** - Transitions now have `interval` to allow grouped elements to animate one by one with a delay between each animation. Grouped animations determine order based on transition direction to avoid reflows, or can manually be reversed by using <code>reverse: true</code> [See Examples](http://www.semantic-ui.com/modules/transition.html#grouped-transitions) for more details.

**Critical Fixes**
- **Transition** - Webkit `failSafe` used for [Chromium Bug #437860](https://code.google.com/p/chromium/issues/detail?id=437860) now also works for queued animations

**Enhancements**
- **Form Validation** - Adds `containsExactly`, `notExactly`, `isExactly` case sensitive validation rules, make `contains`, `not`, `is` case insensitive.
- **Form Validation** - `contains` rule is now case insensitive
- **Form Validation** - Validation messages no longer increase field height on `inline fields` like checkboxes after error appears
- **API** - Added `was cancelled` to determine whether request was cancelled by `beforeSend`
- **Image* - Added `hidden image` state

**Fixes**
- **Build Tools** - Fixed issue with recursive merge for site themes in update scripts, [details here](https://github.com/Semantic-Org/Semantic-UI/pull/1845) Thanks @derekslife
- **Cards** - Fix `.ui.cards > .ui.card` margins to match `.ui.cards > .card` margins
- **Cards** - Fix consecutive card groups to preserve row flow (similar to consecutive grids)
- **Sidebar** - Sidebar using `exclusive: true` now queue animations after hiding previous sidebar (unless `overlay`) to avoid rendering issues
- **State** - Text states now handle `cancelled` API requests correctly
- **Search** - Category search no longer displays unnecessary error message about maxResults
- **Composer** - Composer.json should now read version from tags, adjusted some fields.
- **Grid** - Stackable grid now has horizontal padding by default on mobile unless nested inside a `ui grid` or `ui segment` (not vertical)
- **Menu** - Fixes pointing menu displaying under dropdown menu

-**Docs**
-**Transition** - `useFailSafe` was incorrectly shown as `false` by default

### Version 1.9.3 - February 20, 2015

**Bugs**
- **RTL** - Fixes `rtl` tasks not running correctly on `gulp build` due to name typo, `build rtl` instead of `build-rtl`
- **Tab** - Fixed bug when loading `remote` content with `tab` where current tab would not hide while another tab is loading
- **Tab** - Tab with remote content and `auto: true` now removes duplicate slashes from url path
- **API** - Simplified `api` debug output to console to more clearly label url and data sent

**Docs**
- **Tab** - Added new tab remote content example with stubbed AJAX using SinonJS

### Version 1.9.2 - February 19, 2015

Added new repositories for css and less only versions, can be installed with
```bash
npm install semantic-ui-less
npm install semantic-ui-css
```

**Bug Fixes**

- **Modal** - Fixes typo causing `middle aligned` image not to work correctly.
- **Build** - `gulp watch` now compiles concatenated css (missing in `1.9.1` only)

### Version 1.9.1 - February 18, 2015

**LESS Changes**

Importing individual components into other less files now requires scoping. This is to prevent issues with variable scope that cannot be resolved inside definitions.

```less
/* Import a specific component */
& { @import 'src/definitions/elements/button'; }
```

Importing `semantic.less` still does not require any special syntax
@import 'src/semantic';


**Bugs**
- Fixed issue directly importing `semantic.less` caused by variable scoping in `.loadOverrides()`.
- Fix bug where `equal height` row could not be `centered`, or less than full width

### Version 1.9.0 - February 17, 2015

### Build Tools

##### NPM Install

- `npm install semantic-ui` is now the recommended path for getting Semantic UI
- Added `npm` `post-install` scripts which automatically install or update semantic

##### Gulp Task Imports

- Semantic tasks are now each defined [in their own file](https://github.com/Semantic-Org/Semantic-UI/tree/master/tasks), and can be directly imported into external gulpfiles. Read more about [importing tasks here](https://github.com/Semantic-Org/Semantic-UI/blob/next/src/README.md)
- If you are using Grunt, you may be able to import these tasks using [Grunt-gulp](https://www.npmjs.com/package/grunt-gulp)

##### LESS Component Imports

- Semantic LESS files can now be directly included in other LESS files.
* You can import all UI with `@import 'src/semantic';`
* You can also import individual definitions using `@import 'src/definitions/elements/button'`.

### UI Changes
**Major Enhancements**
- **Card** - Cards now equalize height by default using `display: flex`. No longer are card heights required to be specified manually to align
- **Flag** - Reduced the file size of flag sprite to a measly 28kb (500%+ file size reduction)
- **Icon** - Added Font Awesome 4.3 including many new icons
- **Input** - Input with dropdowns is now much easier, see docs. `action input` and `labeled input` now use `display: flex`. `ui action input` now supports `<button>` tag usage (!) which support `flex` but not `table-cell`
- **Segment** - Added plural variation `ui segments` that stack together in groups without using additional class names

**Enhancement**
- **API** - API now has an ``onRequest`` callback setting that receives the XHR promise after initializing the request
- **Button** - Loading buttons no longer receive `pointer-events` in default theme. Added variable for `loading button` opacity.
- **Card** - Card now has colored variations **Thanks @romuloctba**
- **Dropdown** - `search selection dropdown` will now close the menu when a `dropdown icon` is clicked
- **Dropdown** - Added new dropdown setting, `forceSelection` which forces `search selection` to a selected value on blur. Defaults to `true`.
- **Flag** - Updated Burma/Myanmar flag to current flag (was pre-2010 flag)
- **Form** - Input rules now apply to `input[type="time"]`
- **Form Validation** - `get values`, `set values` now support multiple select e.g. `field[]`
- **Form Validation** - Dropdown and checkbox will now validate after interaction with `on: 'blur'`
- **Headers** - Headers can now contain images alongside text, added examples to docs
- **Icon** - Added woff2 icon files for supported browsers (20% file-size decrease) **Thanks FontAwesome**
- **Label** - `ribbon label` can now be used inside `ui image` and `ui card` correctly
- **Sidebar** - Sidebars in IE now work correctly with `context` specified
- **Rating** - Vertical alignment of `ui rating` with inline content now accounts for parent line height

**Bugs**
- **All Modules** - Fixed bug where element `destroy` could remove third party events when re-initialized
- **Breadcrumb** - Breadcrumb icon now has exact px value to alleviate vertical align issues
- **Card** - Star / Like button colors have been fixed to match `ui rating` inside `card`
- **Card** - Hiding a card with `display: none` no longer causes layout issues with `(x) cards`
- **Card** - `image` inside `content` no longer has a fixed size **Thanks @romuloctba**
- **Form** - `info message` are no longer hidden by default inside `ui form`
- **Form** - Lightened error dropdown hover text color to be more legible
- **Dropdown** - Upward dropdown now has upward arrow icon
- **Icon** - `external link` and `external link square` has been renamed to `external icon` to no longer receive `link` styles by default
- **Modal** - Modal now swaps to `scrolling modal` when `close icon` no longer can be displayed, instead of modal `content`
- **Steps** - Fixed bug where evenly divided steps were no longer fluid
- **Transition** - Fixes bug where `moduleNamespace` was being omitted
- **Transition** - Transitions with direction now use word order dependency to prevent conflict with component directions, for example `bottom left popup slide down in transition

**Docs**
- Fixed bug with chinese mirror modal appearing on every page load when selecting chinese language

### Version 1.8.1 - January 26, 2015

**Bugs**
- **Grid** - Removed `text-align: left` from column definition. Now inherits from grid.
- **Input** - `ui labeled input` now uses  `flex` added example in ui docs with dropdown
- **Input** - Fix border radius on `ui action input` with button groups, aka `ui buttons`
- **Popup** - Popup `hide all` will now use transition set in `settings.transition` when closing other popups
- **Grid** - Fix `doubling grid` setting `100% width` which may cause

### Version 1.8.0 - January 23, 2015

[View Closed Issues](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A1.8.0+is%3Aclosed+sort%3Acomments-desc)
[View Commits](https://github.com/Semantic-Org/Semantic-UI/compare/1.7.3...1.8.0)

**Key Features**

- **Form** - Form now has new methods `reset`, `clear`, `set value(s)`, and `read value(s)` for modifying and reading form data. Check docs for details on implementation. **Thanks @mktm**
- **Search** - Search `onSelect` now receives JSON object matching currently selected element, you can now programmatically retrieve result JSON using `.search('get result', 'query')` or `.search('get results')`. `get result` will default to current value unless specified as first parameter.
- **Transition** - Added many new transitions, and new directions for existing transitions **Thanks @ph7vc**
- **Dropdown** - Dropdown now stores `placeholder text` (prompt text) as separate from `default text` (text set on page load). You can now reset placeholder conditions using `$('.ui.dropdown').dropdown('clear');``

**Enhancements**
- **API** - Added new behavior `$.api('abort')` which cancels current request
- **Dropdown** - Keyboard navigation will now allow opening of sub menus with right/left arrow. Enter will open sub-menus on an unselectable category (`allowCategorySelection: false`) as well.
- **Dropdown** - Mutation observers will now observe changed in `<select>` values after initialization, and will automatically update dropdown menu when changed
- **Dropdown** - Dropdown behavior `set selected` will now also call `set value` automatically, so you do not have to invoke two behaviors to update a `selection dropdown` **Thanks @mktm**
- **Form** - Form will now prevent browsers from resubmitting form repeatedly when keydown is pressed on input field.
- **Header** - Content headers now inherit `@h1-h6` sizes from `site.variables`
- **Header** - Sub headers now adjust in size depending on header size, added new variables for subheader resizing
- **Search** - Greatly reduced search delay from `300ms` to `100ms`. Previous request will automatically abort `xhr` when new request made
- **Search** - Search `onSelect` and `onResultsAdd` can now cancel default actions by returning `false`.
- **Transition** - Transition duration now defaults to what is specified in `css`, to set custom duration you can still pass at run-time as a different value. Animation duration no longer set by default during animation.
- **Transition** - Transition will now prevent repeated animations when using an inferred direction i.e. animation without `in` or `out` specified. When `queue: true` only animations with explicit direction, e.g. `fade in`, will be ignored when called repeatedly.

**Bugs**
- **API** - Fixed bug where `$.api('get xhr')` was not correctly returning xhr promise
- **API** - Fixed bug where API would query resource immediately when specifying `on: false`
- **Button** - ``ui vertical basic buttons` now have dividers in default theme
- **Button** - Fixes formatting for `disabled button` inside `ui buttons`
- **Checkbox** - Checkbox now only modifies `input[type="radio"]` and `input[type="checkbox"]` ignoring any other inputs
- **Dropdown** - Dropdown no longer will not show menu when no `item` are present in menu. Dropdown will now only filter results for `ui search dropdown` #1632 **Thanks PSyton**.
- **Dropdown** - Dropdown will now produce an error if behaviors on an initialized `<select>` are not invoked on `ui dropdown`
- **Dropdown** - Fixed bug where link items would not open in sub-menus due to `event.preventDefault`
- **Label** - Fixed `ui corner label` appearing on-top of `ui dropdown` menu due to issue in z-index hierarchy
- **Label** - Fixed issue with `ui ribbon label` not positioning itself correctly when using sizes like `small` or `large`
- **List** - `relaxed list` and `very relaxed list` no longer add padding to child menu items
- **Popup** - Popup will now only use a max of one element when `settings.popup` mistakingly passes multiple DOM elements
- **Popup** - Popups will now by default appear over all UI content, even dimmers.
- **Search** - Search results no longer hide/show when user changes tab or page loses focus
- **Sidebar** - Fixed bug with `pusher` inheriting first child margins due to `margin-collapse`
- **Sidebar** - Mobile `is mobile` was using RegExp `test()` which would return an incorrect value when called multiple times
- **Sidebar** - Sidebar will now only close if you click on `pusher` or underlayed `body` (scale out). Clicking on fixed elements will not close sidebar.
- **Transition** - Fixed bug with animations that contain the strings 'in' or 'out' as part of their names, for example "swing"
- **Sticky** - Fixes issue with container size not being set explicitly on rail due to improper method renaming

### Version 1.7.3 - January 16, 2015

- **Installer** - Fix issue with component list in `semantic.json` not correctly overriding default components

### Version 1.7.(1-2) - January 15, 2015

**Bugs**

- **Installer** - Fixes installer not including RTL parameter correctly
- **UI** - Fixes `progress`, `ad`, and `sidebar` not loading `.override` files correctly
- Removed undocumented components from `theme.config.example`

### Version 1.7.0 - January 14, 2015

**Major Changes**
- **Project** - Right-to-left (RTL) support added. New gulp tasks for RTL file generation and install setting. Docs however do not yet support RTL.*Thanks @MohammadYounes for constant support with RTL!*.
- **Project** - Install now let you specify the outputted file permissions (express/custom install)

**Enhancements / Changes**
- **Grid** - Added `equal width` variation using `flex-box`, `equal height` now also uses `flex-box` (this may have to be removed if causes unexpected browser issues)
- **Sidebar** - Having a sidebar visible on page load is now much simpler. You can include ``ui visible sidebar`` on page load to have a sidebar element appear on page load. To close call `$('.ui.sidebar').sidebar('hide')`
- **Sidebar** - Added documentation on using sidebar on a custom context. Sidebars using a custom context no longer add background colors like those initialized on `body`
- **Site** - Form input highlighting color added (helps differentiate form colors with autocompleted fields). Default text highlighting color moved from highlighter yellow to a mellow blue.
- **Dropdown** - Javascript Dropdown can now be disabled by adding ``disabled` class. No need to call `destroy`. **Thanks Psyton**
- **Dropdown** - Search dropdown input can now have backgrounds. Fixes issues with autocompleted search dropdowns which have forced yellow "autocompleted" bg.
- **Dropdown** - Fix issue with search selection not correctly matching when values are not strings
- **Progress** - Progress bars can now display percent or amount left using `{value}` in text templates
- **Dropdown** - New `upward dropdown` variation, which opens its menu upward. Default animation now uses ``settings.transition = 'auto'` and determines direction of animation based on menu direction
- **Dropdown** - Dropdown matching fields without values now trims whitespace by default
- **Checkbox** - Checkbox now toggles on spacebar when focused (previously only toggled on enter key).
- **Popup** - Popup now uses its own custom method for determining `offsetParent` meaning 3D contexts (like inside an animation) no longer should break positioning
- **Popup** - Popup now uses `preserve: false` by default, this is slightly less performant but will reduce page clutter caused by leaving generated elements in the DOM

**Code / Build**
- **Build** - `Dist/` files now set file permissions in build. `644` by default. Can adjust in `semantic.json` or during gulp install. You will need to run `npm install` to add the new gulp-chmod dependency *Thanks @PeterDaveHello*
- **Sidebar** - `setup layout` not occurs synchronously if you initialize a sidebar without the proper html. This makes sure calls to sidebar will occur correctly before the page is setup. A new setting `delaySetup` will override this, increasing performance.
- **Modules** - Remove use of deprecated `.size()` for `.length` across all modules
- **Modules** - Use of `$.proxy` swapped to native `function.call()` for performance gains across all modules

**Bugs**
- **Video** - Video component now uses `//` instead of defaulting to `http`
- **Dropdown** - `restore defaults` will now set placeholder styling and remove active element. Added example in docs.
- **Dropdown** - Fixed bug where sub menus may sometimes have dropdown icon overlap text
- **Dropdown** - Fixes dropdown search input from filtering text values when input is inside menu, i.e "In-Menu Search"
- **Dropdown** - Fix issue with search selection not correctly creating RegExp when select values are not strings **Thanks @alufers**
- **Dropdown** - Fix issue with `left floated` and `right floated` content sometimes not applying correctly
- **Popup** - `wide` and `very wide` popup will now appear when screen size is below their `max-width`
- **Popup** - Popup no longer blurs element on popup hide
- **Segment** - ``ui tabular menu`` now correctly aligns with attached segment when using fluid variation *Thanks @MohammadYounes*
- **Segment** - `basic segment` no longer removes padding on first and last elements
- **Steps** - Steps now use ``table-cell`` to allow steps to be equal height by default, even with different content height.
- **Button** - Fix issue with labeled icon groups in material theme
- **Progress** - Fixes bug with progress that use ``total`` and ``value`` receiving the wrong values for text templates
- **List** - Fix some styling issues with `ui list` inside `ui menu`

### Version 1.6.4 - January 12, 2015

- `1.6.3` contained an unintentional character at beginning of `label.less` re-released as `1.6.4`

**Bugs**
- **Build** - Fix CSS property typo in list icon, and label causing issues with some custom build tools

### Version 1.6.3 - January 12, 2015

- `1.6.3` contained an unintentional character at beginning of `label.less` re-released as `1.6.4`

**Bugs**
- **Build** - Fix CSS property typo in list icon, and label causing issues with some custom build tools
- **Label** - Fix attached labels to have correct border radius inside of attached segments of all kinds

### Version 1.6.2 - January 06, 2015

**Site Variables**
- **Site** - EM values for `small` `large` etc are now all calculated from ``@emSize`` allowing you to only change one variable.

**Bugs**
- **Button** - Fixes active orange button color
- **Menu** - Fixes ``fluid text menu`` to have correct margins

### Version 1.6.1 - January 05, 2015

**Bugs**
- **Accordion** - Accordion now uses ``useFailSafe: true`` to avoid callbacks not occurring because of race conditions with `transitionend` in webkit

### Version 1.6.0 - January 05, 2015

**Build**
- **Dist** - Build will now output version number in comment banner

**Updates / Enhancements**
- **Accordion** - Child element animations now use ``$.fn.transition`` and css animations by default (if available)
- **Accordion** - Added ``animateChildren`` option to disable/enable opacity animation on child elements
- **Accordion** - Accordion now uses `easeOutQuint`` instead of ``easeInOutQuint`` to increase perceived responsiveness of drawers
- **Grid** - ``stackable grid`` now only adds horizontal padding when using ``stackable page grid``, otherwise content will take up full width of parent element

**Bugs**
- **Tab/Segment** - Fixes first tab being 1pixel taller than all other tabs
- **Popup** - Fix issue with `ui popup` receiving error ``$offsetParent is undefined`` when using a pre-defined popup
- **Popup** - Fix issue with ``ui popup` not appearing with ``ui flowing popup`` due to newly added ``min-width: max-content``
- **Form** - ``ui search dropdown`` inside a form has incorrect focus style
- **Menu** - Fixes ``ui fluid labeled icon menu`` to not have `min-width`

### Version 1.5.2 - January 02, 2015

**Bugs**
- **Sidebar** - Fix bug with `useLegacy` introduced in `1.5.1`

### Version 1.5.1 - January 01, 2015

**Bugs**
- **Button** - Fixed vertical alignment of ``ui animated button``
- **Search** - Fixed issue with local search returning all results due to improper regexp

### Version 1.5.0 - December 30, 2014

**Critical Bugs**
- **Build Tools** `1.4.0` introduced a bug with concatenated uncompressed ``dist/`` release including minified code. This would occur only when no components were specified in installer or ``semantic.json``.

**Enhancements**
- **Dropdown** - New setting ``allowCategorySelection`` lets menu items with sub menus be selected. Added example in docs.
- **Reset** - Reset now inherits ``box-sizing`` [from html tag](http://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/)
- **Label** - ``ui ribbon label`` can now appear on the right side of content when specifying ``ui right ribbon label``
- **Checkbox** - Checkboxes now can handle labels with multiple lines of text
- **Progress** - Progress bars now display all intermediary percentage values when animating. Improved performance when progress bar is rapidly updated.
- **Popup** - Popup now uses the new property ``min-width: max-content`` to allow for better display with ``inline`` in some circumstances where it escapes parent element.
- **Table** - Table now has coupling with image to make sure size is preserved correctly with table sizing when used inside a table cell.
- **Menu** - ``ui fixed menu`` now defaults to ``ui top fixed menu``

**Bugs**
- **Form** - Fixed (x) wide field not having correct bottom field margin when in ``fields`` group on tablet or mobile
- **Tab** - Calls to global ``$.tab()`` would not pass arguments correctly
- **Dropdown/Search** - Fixed issues with ``ui search`` and ``ui search dropdown`` using ``RegExp test`` which [advances pointer on match](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test) causing results to display incorrectly
- **Form** - ``ui input`` now receives the same formatting as a normal input inside an ``inline field``
- **Grid** - Fix display of equal height stackable grid. Add padding to divided stackable grid for dividers
- **Input** - Fixed bug when ``ui action input`` uses a ``ui icon button``, button was receiving `i.icon` formatting.
- **List** - Fixed bug when using ``ui icon button`` or ``ui icon header`` causing element to receive icon formatting
- **Grid** - Fixed issues where negative margins on ``ui stackable grid`` could cause horizontal scroll bars on mobile
- **Popup** - Popup destroy will now also destroy any unfired timers (show/hide delay)
- **Popup** - Popup now moves to the same offset context to avoid positioning errors when using a named pre-existing popup.

### Version 1.4.1 - December 23, 2014

**Build Tools**
- ``gulp build`` will now only build `dist/components/` for components selected in install
- Fixed bug where interactive installer was not correctly setting components in ``express`` and ``custom`` install

**Bugs**
- **Dropdown** - ``<select>`` elements will now preserve original ``<option>`` order by default. Added ``sortSelect`` setting (disabled by default) to automatically sort ``<option>`` on initialization
- **Button** - Fixes issue with ``will-change`` property added to ``ui button`` causing layout z-indexing issues (dropdown button)

### Version 1.4.0 - December 22, 2014

[Browse Issues for 1.4.0](https://github.com/Semantic-Org/Semantic-UI/issues?q=milestone%3A1.4.0)

**Enhancements**
- **Modal** - Modal now accepts custom dimmer settings with setting `dimmerSettings``
- **Form** - Form inputs without ``type`` specified are now formatted **Thanks PSyton**
- **Accordion** - Added inverted accordion variation

**Bugs**
- **Progress** - Fixes bug where ``ui indicating progress`` would not update its label immediately in webkit
- **Button** - Fix Chrome bug with buttons sometimes not correctly repainting (particularly evenly divided groups)
- **Menu** - Fix border radius of dropdown menu inside `ui vertical menu`
- **Menu** - Fix formatting of ``ui selection dropdown`` inside ``menu``

**Docs**
- Improved documentation for API and Tab to be slightly more comprehensive

### Version 1.3.2 - December 17, 2014

- **Modal** - Fixed issue with modal dimmer appearing cut off in some browsers, and not hiding

### Version 1.3.1 - December 17, 2014

- **Button** - Dist version of button accidentally included ``chubby`` theme instead of ``default`` theme

### Version 1.3.0 - December 17, 2014

[Browse Closed Issues for 1.3.0](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A1.2.1+is%3Aclosed)

**Critical Bugs**
- **Build Tools** - Fixed issue with ``theme.config`` causing ``gulp watch`` to throw an error

**Enhancement**
- **Dropdown** - Dropdown can now specify which direction a menu should appear left/right, dropdown icons can also appear on the left
- **Dropdown** - Full text search now defaults to ``false``, meaning search terms will return only results beginning with letters
- **Dropdown** - Search Dropdown is now much more responsive, js improvements and input throttling added.Throttling defaults to `50ms` and can be modified with settings ``delay.search``
- **Dropdown** - Search Dropdown now correctly replaces placeholder text when backspacing to empty value
- **Dropdown** - Search Dropdown now has a callback when all results filtered ``onNoResults``
- **Dropdown** - Search dropdown will now strip html before searching values when searching html
- **Dropdown** - Search now has keyboard shortcut to open dropdown on arrow down
- **Form** - Form will no longer process validation rules on disabled fields
- **Label** - Corner attached labels now display correctly inside of attached segments
- **Steps** - Steps are now responsive for mobile by default, and have optional responsive styles for tablet
- **Table** - Table has now variations to remove responsive stylings, specify responsiveness for tablet
- **Table** - Table now has a ``structured table`` type, which removes some formatting considerations to support complex table layouts with ``colspan`` and ``rowspan``

**Bugs**
- **Button** - Button "or" positioning variables have been adjusted to be automatically calculated without magic numbers
- **Dropdown** - Dropdown now always scrolls to active element on menu open, calculates position with new ``loading`` class
- **Dropdown** - Fix bug in position of sub menus with ``floating dropdown``
- **Form** - Fixed positioning of horizontal field groups, aka ``fields`` for mobile.
- **Grid** - ``stackable grid`` now display correctly when nested inside a different ``stackable grid``
- **Image** - UI image now works with SVG
- **Modal** - Fixed issue with modal losing scroll position on mobile
- **Modal/Dimmer** - Fixed issues with modal hiding during showing and showing during hiding, fixed issues with "hiding other" modals while a modal is mid-animation.
- **Segment** - Vertical segments now have padding on first/last element, fixing issues when using with grids
- **Sidebar** - Mobile sidebars now only set ``overflow`` on page's ``html`` when browsing from ``iOS`` devices. Using overflow caused issues with page's scroll being lost when resizing a browser to mobile widths. This also affected modules that used  `$(window).scrollTop()`` at mobile screen sizes
- **Step** - Fix issue with completed ordered step icon alignment
- **Table** - Fix responsive styles when applied to ``definition table``.
- **All UI** - Adds error message when triggering an invalid module behavior i.e. typos ``$('.dropdown').dropdown('hid');``

**Docs**
- **Button** - Add tabindex /keyboard nav documentation
- **Grid** - Add another grid example
- Updates to reflect all new changes to UI listed above

### Version 1.2.0 - December 08, 2014

[Browse Closed Issues](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A1.1.3+is%3Aclosed)

**Enhancement**
- **Form** - Form validation now has parameter ``optional`` which will only validate a field against a set of rules if the user does not leave it blank **Thanks DHNCarlos**
- **Fonts** - Add font subset variable for ``site.variables`` **Thanks gabormeszoly**
- **Modal** - Default modal shadow now more subtle
- **Sidebar** - Now has behaviors ``is open/closed`` that are aliases for ``is visible/hidden``
- **Checkbox** - JS Checkbox now handles several variations of html. Labels can be before inputs, after, or not included at all. This should work better with server side form generation.
- **Progress** - Adds ``limitValues`` setting to adjust values outside of 0-100 automatically to within range, defaults to true

**Bugs**
- **Grid** - Fixes ``ui stackable grid`` sometimes not aligning correctly at mobile sizes with ``ui page grid``
- **Progress** - Fixes issues with setting progress to 0% not working as expected
- **Modal** - Fixes issues with multiple modals sometimes not closing dimmers
- **Modal** - When a second modal that is not scrolling is opened after a scrolling modal it no longer causes the first modal to not be scrollable
- **Modal** - "Hammer" clicking multiple times on a hiding dimmer no longer causes animation issues
- **Sidebar** - Fixes issue with multiple sidebars sometimes causing dimmer to close prematurely
- **Sidebar** - Dimmer can now be clicked even before sidebar has finished showing to immediately close sidebar
- **Item/Card** - Default link formatting inside element simplified to avoid adjusting other nested ``ui`` link styles
- **Dropdown** - Fixes bug with dropdown converted from ``select`` that use ``<option`` values with capital letters not being selectable
- **Form** - Fixes required checkbox asterisks formatting incorrect

**Docs / Build**
- Fixed documentation on dropdown actions, form field widths, form validation types, and many odds & ends
- Adds components to semantic.json.example
- Theme.config.example now links to final site folder

### Version 1.1.2 - December 03, 2014

- **NPM** - Fixes issue with ``dist/`` not being included when using NPM due to ``.gitignore``

### Version 1.1.1 - December 03, 2014

**Bugs**
- **Step** - Fixes step content appearing overlapped due to use of ``em`` instead of ``rem`` for line-height.
- **Sidebar** - Fixes issue that may cause sidebars to stay open in some circumstances when using multiple sidebars

### Version 1.1.0 - December 02, 2014

**Enhancements**
- **Transition** - Transition's caching of final display state and animation existence now has improved performance.
- **Popup** - Popup now has a ``settings.prefer`` that defaults to ``adjacent``. This setting sets prefered next placement when a popup cannot fit on screen in the chosen placement. ``prefer`` can also be set to ``opposite`` to prefer the same position on the opposite side
- **Popup** - Popup can now use a setting ``lastResort``. When set to a position it will be used as a last resort even if popup does not entirely fit on the page. Setting this to ``false`` will produce an error when a popup cannot fit on screen.
- **Transition** now has ``useFailSafe`` parameter (off by default) to ensure transition callback fires even if native ``onAnimationEnd`` event does not fire due to element visibility. [Chromium Bug Report by Product Manager @ Mozilla](https://code.google.com/p/chromium/issues/detail?id=135350#c2) and [this open issue](https://code.google.com/p/chromium/issues/detail?id=437860)
- **All UI** - Many ``em`` measurements adjusted slightly to calculate out as exact pixel values (Fixes 1px rounding errors)
- **Steps** - Now use global border color
- **Progress** - Progress now has sizing variations
- **Input** - ``transparent input`` can now be ``inverted``
- **Dropdown** - Dropdown ``onChange`` callback now fires when calling ``setSelected`` programatically.

**Bugs**
- **Build Tools** - NPM now correctly pins dependencies instead of using bleeding-edge versions which may break builds
- **Transition** - Transition now correctly detects missing animations, errors do not cause future image transitions to break
- **Menu/Segment** Fixes double border on pointing menu with attached segment **Thanks davialexandre**
- **Progress** - Fixes indicating progress appearing incorrectly at 100% complete **Thanks ordepdev**
- **Icon** - ``remove icon`` is now formatted correctly when used as ``remove link icon``
- **Input** - ``ui action input`` can now accomodate ``ui button`` that adjust padding from default
- **Dropdown** - Fix ``action input`` used inside ``ui dropdown`` to appear correctly **Thanks ordepdev**

**Docs**
- **Progress** - Added missing settings docs for progress module

### Version 1.0.1 - November 28, 2014

**Bugs**
- **Site** - Add protocol variable for Google Font loader to avoid issues with ``//`` when loading locally causing freezing
- **Icon** - Fix horizontal centering of circular icon
- **Transition** - Fix vertical flip not working due to css typo **Thanks cgroner**
- **Menu** - Removes missing image loader variable **Thanks ryan-mahoney**
- **Card/Item** - Fix generic link stylings erroneously affecting linked ui elements like buttons
- **Table** - Fixes table cell transition animating all properties

### Version 1.0.0 - November 24, 2014

**Breaking Changes**
- **Word Order** - Many multi word variations now require proper word order, for example ``left aligned`` or ``right floated`` classnames must be adjacent. This is to prevent conflicts with other multiple word variations
- **Form** - Date field has been removed, use a ``ui icon input`` with a ``calendar icon`` instead
- **Label** - Corner labels no longer support text, only icons.
- **Dropdown** - Sub menus inside dropdowns now need a wrapping div **text** around sub-menu descriptions
- **Checkbox** - Checkbox "enable" and "disable" have been replaced with "check" and "uncheck"
- **Modal** - Modal ``left`` and ``right`` sections are now replaced with ``image`` and ``description``
- **Accordion** - Accordions are now unstyled by default allowing for simpler coupling with other UI without having to override styles. Styled accordions are now included as a variation ``ui styled accordion``
- **List** - List item selectors are now more strict, list items must be immediate children of ``ui list`` or ``ui list list``
- **Item** - 0.x.x's UI card has been adjusted heavily. Vertically listed content should use ``ui item`` while floated grouped content should continue to use ``ui card``. Some 'card' view content has been slightly adjusted. Please refer to documentation
- **Header / Icon** - Inverted headers and icons no longer invert background colors, but instead use a lighter version of colors more legible on dark backgrounds. Inverted circular icons, still however invert the color of the circle.
- **Input** - Labeled inputs now have ``corner`` ``left`` and ``top`` label types. Any labeled inputs should be converted to ``corner labeled input`` to preserve functionality from ``0.x``
- **Modal** - allowMultiple (allowing multiple modals at once) is now set to **false** by default.
- **Table** - Tables are no longer striped by default, instead you must specify the 'striped' variation
- **Transition** - Complete, and Start callbacks are now ``onComplete`` and ``onStart``

**Enhancements**
- **General** - CSS animations now hint with will change properties to increase performance in supported browsers
- **General** - Many modules now use DOM Mutations and event delegation to allow content adjustment after initialization
- **Accordion** - Accordion now includes all icons in an embedded font instead of requiring icons
- **Button** - Now has compact form, used for fitting into tight spaces
- **Button** - Now has CSS loaders to allow loading state to maintain other styles
- **Checkbox** - Now correctly handles read-only and disabled, has read-only and disabled states
- **Checkbox** - All styles have been redone. Standard checkboxes are now based around PX and not EM making sure there are no unusual circles or rounding issues. Checkboxes also now use a custom font for glyphs instead of CSS tricks.
- **Checkbox** - Checkbox now have a ``fireOnInit`` setting for firing callbacks on page load
- **Checkbox** - Checkbox now receive a ``checked`` class when checked, making it easier to write css selectors on checked checkboxes, for example when using sibling selectors ``.ui.checked.checkbox + .content { // style }``
- **Dropdown** - New dropdown type, searchable selection for large lists of choices
- **Dropdown** - Dropdowns can now be initialized directly on a ``<select>`` element without any html
- **Dropdown** - New action combo will change text of adjacent button, select will select element but not change text
- **Dropdown** - Many new content types now work inside dropdowns, headers, dividers, images, inputs, labels and more
- **Form** - Form now has a success state which will automatically display success messages
- **Dimmer** - Dimmer will now automatically determine whether click-to-close is enabled by ``settings.on``
- **Dimmer** - Multiple dimmers can now be used on the same context with ``dimmerName``
- **Dimmer** - Dimmer variations can be specified when creating a dimmer from javascript using ``variation`` setting.
- **Form** - Grouped fields and inline fields can now have labels
- **Form** - Forms in 'success' state will now show success messages inside
- **Form** - Inputs now use 1em font size and correctly match selection dropdown height
- **Form** - Inverted form now properly styles loader
- **Form** - New field type ``required`` formats labels to show filling out field is mandatory
- **Grid** - ``ui divider`` can now be used inside of row columns as well as ``vertically divided grid`` variation
- **Grid** - Grid rows and columns now support color variations
- **Grid** - Grid has been rewritten to automatically create row flow without row wrappers
- **Grid** - Divided and celled grids can now be inverted for dark backgrounds
- **Grid** - Elements inside a grid that are not rows or columns will now align properly
- **Grid** - Fixed page grid allows for fixed pixel size containers used with a grid instead of percentage
- **Grid** - Vertically divided grid now does not include left/right gutters in divider
- **Header** - Linked headers now receive link colors
- **Image** - New ``bordered image`` variation
- **Item** - Items now have a horizontal list view for content lists
- **Label** - Added tag label and empty circular label style
- **Label** - Now has compact form, for fitting into tight spaces
- **Label** - Now has more sizes available
- **List** - Child lists can now be formatted to sit inside text content
- **List** - List images can now specify vertical alignment
- **List** - List spacing defaults have been adjusted to be more consistent
- **Popup** - Popup can now allow itself not to be closed when hovered over
- **Popup** - A popup element can now be specified on initialization.
- **Reveal** - Reveals now all use css properties with GPU acceleration
- **Popup** - Positioned popups will now extend in the opposite direction to fit better with floated content
- **Rating** - Rating now uses an embedded icon font to maximize compatibility
- **Rating** - Rating can now automatically generate icons without including them
- **Rating** - Rating can use data attributes to specify individual ratings
- **Sidebar** - Sidebar now has tall / very tall variations for resizing top/bottom sidebars
- **Shape** - Shape now is better at calculating sizes when animating
- **Shape** - You can now disable repeated animations by setting, so animation wont queue if side is currently visible
- **Steps** - Steps can now have icons, descriptions and titles. Step default theme has been modified significantly to be more flexible.
- **Table** - Tables now have 'basic' and 'very' basic variations
- **Transition** - Transition will now keep block position of elements hidden with visibility hidden
- **Transition** - Transitions now will handle multiple display types more consistently
- **Transition** - Transition now has a new ``start`` callback, before animation starts
- **Transition** - Complete callback now does not occur if animation is interrupted before completing
- **Transition** - You can now specify the final displayType of a transitioning element in metadata or settings (not just automatically detected)
- **More [untracked changes](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+label%3AEnhancement+is%3Aclosed) added as well**

** Bug Fixes **
- See Closed GitHub Issues

### Version 0.19.3 - Sep 11, 2014

**Bug Fixes**

- **Grid** - Fixes issue where some responsive grid stylings were being overridden by other variations (for example stackable overriding )

### Version 0.19.2 - Sep 11, 2014

**Bug Fixes**

- **Grid** - (Backport from 1.0 branch) Fixes issue where some combinations of (tablet/mobile/computer) only does not function correctly

### Version 0.19.1 - Sep 5, 2014

**Bug Fixes**

- **Modal** - (Backport from 1.0 branch) Fixes issue where modal sometimes appears too low on second show

### Version 0.19.0 - July 3, 2014

**Enhancements**
- **Transition** - Adds "fade in left/right" variations to match "fade up/down" **Thanks AdamMaras**

**Fixes**
- **Accordion** - Fixes incompatibilities with ``ui list`` when used inside a ``ui accordion``, fixes issues with menu accordion display in some circumstances
- **Menu** - Fixes ``ui inverted secondary pointing menu`` to have correct pointer color for all color variations **Thanks AdamMaras**
- **Docs** - Language clarified for menu/rating definition **Thanks jnbt/ewiner**

### Version 0.18.0 - June 6, 2014

**Enhancements**
- **Modal** - Modals now focus on first input if available **Thanks Knotix**
- **RTL** - RTL now uses RTLCSS instead of CSSJanus **Thanks MohammadYounes**

**Fixes**

- **Menu** - Fixes bug where pointing menu would sometimes appear below content **Thanks Skysplit**
- **Dropdown** - Fixes dropdown 'is animating' with dropdowns when CSS animations were not included **Thanks nathankot**
- **Accordion** - Accordion title does not know have to be :first-child to receive proper border **Thanks BigBlueHat**
- **Popup** - Fixes javascript animation of popup missing easing dependency
- **Label** - Fixes border radius on bottom left label

**Docs**
- **Modal** - Docs now have HTML examples
- **Docs** - Fixes issue with overview mode not clearing code examples
- **CSS Guide** - Fixes typos in css guide


### Version 0.17.0 - May 9, 2014

**Enhancements**
- **Dropdown** - Dropdowns can now receive focus and be navigated with a keyboard **Thanks Musatov**
- **Popup** - Popup now has an ``onRemove`` callback after removing element from DOM

**Fixes**
- **Modal** - Element does not accurately close other modals when initialized at different times **Thanks nojhamster**
- **Modal** - Fixes javascript error for browsers that don't support CSS animations if jquery.easing is not included
- **Form, Input** - Fixes ``ui input`` to work correctly inside ``inline field``

### Version 0.16.1 - April 22, 2014

**Fixes**
- **Transition** - Fixes bug where transition could accidentally hide element on show due to error when determining original display type

### Version 0.16.0 - April 22, 2014

**Enhancements**
- **Form** - Fields can now be aligned to a grid **Thanks seralex-vi**

**Critical Fixes**
- **Modal** - Fixes issue where position sometimes appeared too low on second show
- **Reveal** - Fixes reveal being broken in Chrome in ``0.15.5`` due to poor fix for reveal selectability

**Fixes**
- **Transition** - Fixes issue where transition hidden was sometimes overwritten by UI styles causing the element to stay visible
- **Checkbox** - Fixes issue where checkboxes with multiple line labels were appearing formatted incorrectly.


### Version 0.15.5 - April 11, 2014

**Critical Fixes**
- **Checkbox** - Fixes ``ui checkbox`` to obey ``disabled`` property of input

**Fixes**
- **Reveal** - Hidden content now can be selected on reveal
- **Message** - Fixes hidden/visible class to work with animations
- **Message** - Fixes hidden/visible class to set proper display on ``ui icon message``
- **Message** - Fixes hitbox/position of ``close icon`` inside message

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
- **Modal** - Fixes element detaching sometimes in case where it is already inside a dimmer
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
- **Rating** - Ratings now receive class disabled when read only, instead of receiving ``active`` when rateable since active are much more common
- **Grid** - Fixes some instances where grid column width ``x wide`` was being overruled by parent element ``x column``.
- **Header, Grid, Segment** - Adds justified alignment
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
- **Button** - Fixes improper active/visible state due to :not specificity (most noticeable in mousedown on a dropdown button)

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
- **Table** - Added awesome new responsive style to ui tables
- **Button** - New social buttons for Instagram, LinkedIn, Google Plus, Pinterest
- **List** - Adds documentation for module format
- **List** - Adds onTabInit for local tabs on first load
- **List** - Popups can now have a different target than itself
- **Modal** - Modal hide can be cancelled from ``onApprove`` and ``onDeny`` by returning false from callback
- **Transition** - onShow and onHide callbacks for visibility changing transitions
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
