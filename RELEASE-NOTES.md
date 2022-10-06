## RELEASE NOTES

### Version 2.5.0 - Oct 6, 2022

**Note**
> Special Note: If you run into any breaking changes with Gulp 4. Please reach out to me at jack@semantic-ui.com with bug reports

**Critical Fix**
- **CSS** - Fix extra semicolon causing CSS build of Semantic UI to fail compilation with various systems #7065 [React Issue](https://github.com/Semantic-Org/Semantic-UI-React/issues/4287) [CSS Repo Issue #81](https://github.com/Semantic-Org/Semantic-UI-CSS/issues/81) [CSS Issue #75](https://github.com/Semantic-Org/Semantic-UI-CSS/issues/75)

**Breaking Changes**
- **Gulp 4** -All tasks have been rewritten to work with Gulp 4. This should fix SUI to install correctly on Node 12 or greater (see [Gulp3 Issue](https://github.com/gulpjs/gulp/issues/2324) for more details)

**Build**
- **Node** - Updated scripts to build in Node 18 via vanilla install.
- **Theme** - Allow site's global site theme to be missing #6876 **Thanks @cruzdanillo**
- **Meteor** - Fix issue with misuse of `api.addAssets` #6790 **Thanks @gimco**
- **Gulp** - Report errors in build #7005 **Thanks @bundyo**

**Examples**
- **Modal** - Fixed mutation observer was not properly disconnected
- **Sticky** - Adds new example for sticky to highlight behavior when sticky/context height varies

**Bug Fixes**
- **Dropdown** - Fix issue where dropdown menu could not open to right when in `right menu` inside a `ui menu` (See examples/sticky.html) for use-case
- **Sticky** - Fix issue where element might be `bound bottom` (fixed to bottom of context) if the sticky element is larger than the context
- **Sticky** - Fix issue when sticky size is larger than context size caused context `min-height` not to be set correctly.
- **Button** - Fix usage of loading on in labeled button #7023 thanks @flppv

### Version 2.4.2 - Oct 21, 2018

**Build**
- Fix issue that could prevent `gulp build` from running due to updates to gulp dependencies **Thanks for assistance @himanshu230** [#6631](https://github.com/Semantic-Org/Semantic-UI/issues/6631) [#6622](https://github.com/Semantic-Org/Semantic-UI/issues/6622) [#6067](https://github.com/Semantic-Org/Semantic-UI/issues/6067)

### Version 2.4.1 - Oct 13, 2018

**Note**
> If you are using the `semantic-ui-less` package with versions of LESS before 3.5 some `calc` values will not be computed correctly due to changes in variable interpolation. It is recommended that you upgrade to at least 3.5 to continue using new versions of SUI. For more information see [#6512](https://github.com/Semantic-Org/Semantic-UI/issues/6512)

**Build**
- **LESS** - SUI now supports less versions greater than `3.5.0` **Thanks @sciyoshi** [#6512](https://github.com/Semantic-Org/Semantic-UI/issues/6512)
- **Gulp** - Migrated deprecated `gulp-util` to `replace-ext` **Thanks @stevelacy** [#6322](https://github.com/Semantic-Org/Semantic-UI/issues/6322)
- **Gulp** - Updated all gulp dependencies to most recent released versions with modifications to tasks as necessary.

**Bug Fixes**
- **Dropdown** - `clearable` dropdown now works with dropdown that arent `on:click`, like `hover` or `manual` triggers. [#6594](https://github.com/Semantic-Org/Semantic-UI/issues/6594)
- **Modal** - Fixed `fullscreen modal` having incorrect left offset with flex modals [#6587](https://github.com/Semantic-Org/Semantic-UI/issues/6587)
- **Embed** - Embed will now correctly remove DOM metadata on `destroy`
- **Grid** - Fix issue with `very relaxed vertically divided grid` having wrong margins on dividers

### Version 2.4.0 - Sep 17, 2018

> `2.4.0` includes a new component `placeholder`. To use this component in your existing SUI site, be sure to add `@placeholder: 'default';` to your `theme.config`. You can see an example in `theme.config.example`

**New Components**
- **Placeholder** - Added `ui placeholder` that can be used to show where content will soon appear.

**New UI Type**
- **Segment** - Added new `ui placeholder segment` used to reserve space for UI when content is missing or empty.

**Major Enhancements**
- **Dropdown** - Added `clearable` dropdowns. When `clearable: true` is specified an (X) will appear to clear dropdown selection [#2072](https://github.com/Semantic-Org/Semantic-UI/issues/2072)
- **Modal/Dimmer** - Modals and dimmers now include a new setting `useFlex` which defaults to `auto`. Modals and dimmers will automatically revert to using non-flex layouts when there may be layout issues with using flexbox. Modals will fall back to JS position when `detachable: false` is used or with IE11/Edge (Absolutely positioned elements inside flex containers in IE behave differently).

**Critical Bugs**
- **Modal** - Fixed issue where `scrolling modal` would not allow for scrolling with touch devices. [#6449](https://github.com/Semantic-Org/Semantic-UI/issues/6449)
- **Label** - Fixed issue where `basic label` were appearing incorrectly **Thanks @lasley / @ColinFrick** [#6582](https://github.com/Semantic-Org/Semantic-UI/issues/6582) [#6440](https://github.com/Semantic-Org/Semantic-UI/issues/6440)
- **Menu/Dropdown** - Fixed `left menu` inside `ui menu` would display horizontally as `flex` [#6359](https://github.com/Semantic-Org/Semantic-UI/issues/6359)

**Bugs**
- **Dimmer** - Dimmer now sets `variation` at runtime, to support run-time swapping between `top aligned` and `middle aligned` using `.dimmer('setting', 'variation', 'top aligned')`
- **Dropdown** - Fixed issue where `onChange` when used with `action: hide` would be missing the third param `$item` [#6555](https://github.com/Semantic-Org/Semantic-UI/issues/6555)
- **Flag** - Add `uk` alias for `united kingdom` **Thanks @PhilipGarnero** [#6531](https://github.com/Semantic-Org/Semantic-UI/issues/6531)
- **Icon** - Fixes missing `disk outline icon` alias [#6556](https://github.com/Semantic-Org/Semantic-UI/issues/6556)
- **List** - Fixed issue where list `content` would not take up 100% width when used alongside `img` or `icon`
- **Menu/Dropdown** - Fixes dropdown item margin not obeyed inside `labeled icon menu` [#6557](https://github.com/Semantic-Org/Semantic-UI/issues/6557)
- **Modal** - Fixes `@mobileTopAlignedMargin` theming variable was not implemented
- **Modal** - Modal now will remove `blurring` after undimming, to prevent issues with `position: fixed` [#6520](https://github.com/Semantic-Org/Semantic-UI/issues/6520)

**Minor Changes**
- **Dropdown** - `inline dropdown` `close icon` default right margin default spacing slightly modified.


### Version 2.3.3 - July 8th, 2018

**Bug Fixes**
- **Search** - Passing in `cache: false` will now affect default settings for `apiSettings` when using a remote endpoint. Previously you would also have to pass in `apiSettings: { cache: false}` as well
- **CSS** - Update LESS syntax to be compatible with LESS 3.0 **Thanks @sciyoshi** [#6447](https://github.com/Semantic-Org/Semantic-UI/pull/6447)
- **Icon** - Several icon names have been deprecated due to incompatibility with `transition in` and `transition out` used in animations.

* `linkedin in` is now `linkedin alternate`
* `zoom in` is now `zoom-in`
* `zoom out` is now `zoom-out`
* `sign in` is now `sign-in`
* `sign out` is now `sign-out`
* `log out` is now `logout`
* `in cart` is now `in-cart`

### Version 2.3.2 - June 18, 2018

**Enhancements**
- **Modal** - Modal and Dimmer now prevent background page from scrolling on mobile or where touch events are present
- **Button** - Add `inverted` and `inverted basic` variations for `primary` and `secondary` buttons  **Thanks @hammy2899** [#6242](https://github.com/Semantic-Org/Semantic-UI/issues/6242)

**Theming**
- **Global** - Add `hover` `down` `active` and `focus` variables for `@invertedPrimaryColor` and `@invertedSecondaryColor`

**Bugs**
- **Dropdown** Fixed bug that could cause dropdown to recursively trigger network requests specifically when using `apiSettings` with a url that returns valid response but with no results when clicking directly on the `dropdown icon`. **Thanks @vpeti** [#5231](https://github.com/Semantic-Org/Semantic-UI/issues/5231) [#5809](https://github.com/Semantic-Org/Semantic-UI/issues/5809)
- **Statistics** - Fix issue where grouped statistics would have excess bottom margin if they are `:last-child`
- **Label** - Fix `basic label` does not use `@basicBackground` variables **Thanks @levithomson**
- **Modal** - Modal will not refocus a field if field is already focused **Thanks @nikolaybobrovskiy** [#6301](https://github.com/Semantic-Org/Semantic-UI/issues/6301)
- **Icon** - Fix `wechat icon` not displaying due to typo **Thanks @alex-karo** [#6429](https://github.com/Semantic-Org/Semantic-UI/issues/6429)

### Version 2.3.1 - Mar 18, 2018

> **A Special Message about Flex Modals**
> There will be an update shortly to resolve issues related to flex modals when using multiple modals and `detachable: false`, in order to not hold up this release, we've decided to move forward without a fix.

> A general solution will most likely require branching code for IE11 which will disable flex (as IE11 doesnt correctly implement the latest spec for [absolute positioned flex containers](https://developers.google.com/web/updates/2016/06/absolute-positioned-children)).

**Critical Bugs**
- **Dropdown** - Fixed issue in `2.3.0` that could cause multiselect dropdowns initialized by converting `<select>` to not add initial selected options. [#6123](https://github.com/Semantic-Org/Semantic-UI/issues/6123)
- **Search** - Fixes using category search with `fullTextSearch: 'exact'` **@Thanks @prudho** returning duplicate results [#6223](https://github.com/Semantic-Org/Semantic-UI/issues/6223) [#6221](https://github.com/Semantic-Org/Semantic-UI/issues/6221)
- **Icon** - Fixes `centered` and `bordered` icons appearing incorrectly with FA5 **Thanks @w96k** [#6192](https://github.com/Semantic-Org/Semantic-UI/issues/6192)
- **Icons** - Fixes missing aliases/incorrect icons from Font Awesome 5 port in `2.3.0` **Thanks hammy2899** [#6181](https://github.com/Semantic-Org/Semantic-UI/issues/6181) [#6175](https://github.com/Semantic-Org/Semantic-UI/issues/6175) [#6176](https://github.com/Semantic-Org/Semantic-UI/issues/6176) [#6174](https://github.com/Semantic-Org/Semantic-UI/issues/6174) [#6175](https://github.com/Semantic-Org/Semantic-UI/issues/6175)
- **Icons** - Fixed issue where `link icon` were appearing incorrectly due to changes in icons [#6180](https://github.com/Semantic-Org/Semantic-UI/issues/6180)

**Enhancements**
- **Search** - Adds disabled variation **Thanks @prudho** [#6225](https://github.com/Semantic-Org/Semantic-UI/issues/6225)
- **Form Validation** - Form can now return their validation prompt dynamically based on their current value. **Thanks @xDaizu** [#6016](https://github.com/Semantic-Org/Semantic-UI/issues/6016) [#3864](https://github.com/Semantic-Org/Semantic-UI/issues/3864)

**Bugs**
- **Dropdown** - Fixed `onChange` missing `text` from callback when dropdown is set to `action: 'select'` **Thanks @martinduparc**  [#4183](https://github.com/Semantic-Org/Semantic-UI/issues/4183) [#4510](https://github.com/Semantic-Org/Semantic-UI/issues/4510)
- **Icons** - Fixes some icons that were incorrectly named. **Thanks hammy2899** [#6181](https://github.com/Semantic-Org/Semantic-UI/issues/6181)
- **Icons** - Added ability to choose whether solid, outline and brand icons should be included in your theme via the `@importSolidIcons`, `importRegularIcons` and `@importBrandIcons` variables **Thanks hammy2899**
- **Icons** - Increased specifity on `fitted icon` to fix compatibility with other components [#6125](https://github.com/Semantic-Org/Semantic-UI/issues/6125)
- **Visibility** - Fixed bug that could cause `onScreen` callback to not occur properly for elements that are taller than screen.
- **Menu** - Fixes `disabled item` showing hover style for `secondary menu` **Thanks @tcmal** [#6268](https://github.com/Semantic-Org/Semantic-UI/issues/6268)
- **CSS Variables** - Added use of `@normal` for normal font weight for all non-default themes included in repo. [#6227](https://github.com/Semantic-Org/Semantic-UI/issues/6227)
- **Image** - Fixes margin being applied twice to `ui images` [#6224](https://github.com/Semantic-Org/Semantic-UI/issues/6224)
- **Reveal** - Fix `whitespace: nowrap;` applying to content inside `slide reveal` and `move reveal`

**Docs**
- Fixes CDN links in docs **Thanks @KSH-code**
- Fixed issue where iframes may not load correctly in `/examples/theming.html` #6269

### Version 2.3.0 - Feb 20, 2018

**Major Enhancements**
- **Icons** - Font Awesome 5 is now included in Semantic UI **Thanks @hammy2899** [#6085](https://github.com/Semantic-Org/Semantic-UI/issues/6085)

- **Search** - Category search can now work with local search by adding a `category` property to any result and specifying `type: 'category'`

```javascript
  var categoryContent = [
    { category: 'South America', title: 'Brazil' },
    { category: 'South America', title: 'Peru' },
    { category: 'North America', title: 'Canada' },
    { category: 'Asia', title: 'South Korea' },
    { category: 'Asia', title: 'Japan' },
    { category: 'Asia', title: 'China' },
    { category: 'Europe', title: 'Denmark' },
    { category: 'Europe', title: 'England' },
    { category: 'Europe', title: 'France' },
    { category: 'Europe', title: 'Germany' },
    { category: 'Africa', title: 'Ethiopia' },
    { category: 'Africa', title: 'Nigeria' },
    { category: 'Africa', title: 'Zimbabwe' },
  ];
  $('.ui.search')
    .search({
      type: 'category',
      source: categoryContent
    })
  ;
```

- **Popup** - Popup can now position elements correctly even when they have a different offset context than their activating element. Like in [this example](https://jsfiddle.net/g853mc03/).

- **Popup** - Popup will now align the center of the arrow (not the edge of the popup) when it would be reasonable (up to 2x arrow's offset from edge). [See this explanation](http://oi66.tinypic.com/2zr2ckk.jpg)

To preserve functionality `movePopup` default has remained as `true` (moving the popup to the same offset context), however now setting `movePopup: false` should now always position correctly. Be sure to use `movePopup: true` to avoid issues with `ui popup` inside `menu`, `input` or other places where it may inherit rules from its activating element or its context.

- **Transition** - Adds new `glow` transition for highlighting an element on the page, and `zoom` animation for scaling elements without opacity tween.

- **Modal** - Modal has been rewritten to use `flexbox`. No need to call `refresh()` to recalculate vertical centering.

- **Modal** - Modals now have a setting `centered` which can be used to disable vertical centering. This can be useful for modals with content that changes dynamically to prevent content from jumping in position.

**Minor Enhancements**
- **Theming** - Added global variables for reassigning `normal` and `bold` font weights for custom font stacks. **Thanks @jaridmargolin** [#6167](https://github.com/Semantic-Org/Semantic-UI/issues/6167)
- **Search** - Category results now has `exact` setting matching dropdown for `fullTextSearch` preventing fuzzy search
- **Search** - Category results will now responsively adjust `title` row if titles are long instead of forcing a title width
- **Dimmer** - Dimmers now have centered content with a single wrapping `content` element.
- **Modal** - You can now modify `closable` setting after init **Thanks @mdehoog** [#3396](https://github.com/Semantic-Org/Semantic-UI/issues/3396)
- **Accordion** - Added `onChanging` callback for accordion that occurs before animation in both directions **Thanks @GammeGames** [#5892](https://github.com/Semantic-Org/Semantic-UI/pull/5892)

**Tiny Enhancements**
- **Popup** - `arrowBackground` now inherits from `background` [#6059](https://github.com/Semantic-Org/Semantic-UI/issues/6059) **Thanks @devsli**
- **Popup** - Adds new variable `headerFontWeight`
- **Search** - Search now has responsive styles for mobile to prevent results being large than page width.

**Bugs**
- **Modal** - Modal `autofocus` setting now checks to see if currently focused element is in modal, avoiding issues where focus could be set in `onVisible` or `onShow`
- **Menu** - Fixes `big` and `huge` sizes being swapped in menu **Thanks @jeremy091** [#5902](https://github.com/Semantic-Org/Semantic-UI/issues/5902) [#5899](https://github.com/Semantic-Org/Semantic-UI/issues/5899)
- **Table** - Fixes tr not having correct border on first row when using multiple `tbody` **Thanks @Mlukman** [#4458](https://github.com/Semantic-Org/Semantic-UI/issues/4458)
- **Popup** - Popup will now use `content` specified in settings before `title` attribute [#4614](https://github.com/Semantic-Org/Semantic-UI/issues/4614) **Thanks @aaronbhansen**
- **Form Validation** - Fixes bug where `on: 'change'` would still show validation prompts on `blur` when using `inline: true` [#4423](https://github.com/Semantic-Org/Semantic-UI/issues/4423) **Thanks @avalanche1**
- **Dimmer** - Fixes issue with `inverted dimmer` with `content` having wrong text color **Thanks @rijk** [#4631](https://github.com/Semantic-Org/Semantic-UI/issues/4631)
- **Images / Transition** - Fixed issue where `ui images` would show nested images with `transition hidden` as block (Fixes sequential img animation demo in docs)

**Doc Updates**
- **Icons** - Icon documentation now has a search that will copy the relevent icon html to clipboard
- **Icons** - Icon documentation now lists publicly all icon aliases

**Doc Bugs**
- **UI Examples** - Fixe some improper html in UI examples included with repo [#6127](https://github.com/Semantic-Org/Semantic-UI/issues/6127) **Thanks @perdian**
- **Admin** - Fixes bug in admin script that caused leaked global vars **Thanks @esbena** [#6136](https://github.com/Semantic-Org/Semantic-UI/issues/6136)

### Version 2.2.14 - Jan 29, 2018

**Critical Bugs**
- **Form** - Fixes issue where radio checkbox would not return correct value from `get values` **Thanks @tincdev** [#5713](https://github.com/Semantic-Org/Semantic-UI/issues/5713) [#6043](https://github.com/Semantic-Org/Semantic-UI/issues/6043)
- **Modal** - Fixes issue where an oversized modal would appear behind an existing modal when using `allowMultiple: true` and a second modal that is larger than the screen height. [#2423](https://github.com/Semantic-Org/Semantic-UI/issues/2423)

**Enhancements**
- **Button** - YouTube's red color now matches their current brand guidelines **Thanks @hammy2899** [#6110](https://github.com/Semantic-Org/Semantic-UI/issues/6110)
- **Flag** - Adds missing flag for England **Thanks @zyzniewski** [#5944](https://github.com/Semantic-Org/Semantic-UI/issues/5944)
- **Reveal** - `ribbon label` can now work with `reveal` [#5681](https://github.com/Semantic-Org/Semantic-UI/issues/5681)
- **Dropdown** - Added new setting `ignoreCase` (defaults to false) that will prevent values from being added that match existing values (case insensitive). This is particularly useful when using allowAdditions for tagging to not allow case insensitive matches.
- **Site** - Site theme now includes `@customScrollbarHeight` and specifies a default horizontal scrollbar height **Thanks @jayphelps** [#5749](https://github.com/Semantic-Org/Semantic-UI/issues/5749)

**Bugs**
- **Checkbox** - Fixes issue where `toggle checkbox` box shadow was missing **Thanks @banandrew** [#5096](https://github.com/Semantic-Org/Semantic-UI/issues/5096)
- **Dropdown** - Fixed issue where dropdowns could incorrectly open upward and leftward opening when using `context` setting due to an incorrect offset calculation. **Thanks @dannyBies** [#5974](https://github.com/Semantic-Org/Semantic-UI/issues/5974) [#5366](https://github.com/Semantic-Org/Semantic-UI/issues/5366)
- **Form Validation** - Fixed issue where default prompts for `contain` and `doesntContain` rules were swapped. **Thanks @xiongyu-git** [#5530](https://github.com/Semantic-Org/Semantic-UI/issues/5530)
- **Visibility** - Fixes issue where `bottomPassed` and `topPassed` would not fire under some conditions
- **Dropdown** - Fixes issue where dropdowns might accidentally animate closed two times when quickly tabbing through fields
- **Popup** - Fixed an error which could cause popup not to move to right offset context when using a different target setting.
- **Dropdown** - Fixed issue where using `ui input` in a dropdown menu could cause the input to be too wide in some cases **Thanks @banandrew** [#5085](https://github.com/Semantic-Org/Semantic-UI/issues/5085)
- **Menu / Popup** - Fixed issue where `inverted menu` rules would cause popup inside a menu to have incorrect link styling in `link list` **Thanks @banandrew** [#5585](https://github.com/Semantic-Org/Semantic-UI/issues/5585) [#5603](https://github.com/Semantic-Org/Semantic-UI/issues/5603)
- **CSS Build** - Fixed issue where package `gulp-clone` was only set to use > `1.0` causing issues with gulp builds due to upstream error [#6067](https://github.com/Semantic-Org/Semantic-UI/issues/6067)

### Version 2.2.13 - Aug 07, 2017

**Hotfix** (2)
- **Install** - Some interactive install script issues may be fixed. Forked `gulp-prompt` plugin to allow for updated `inquirer` version
- **Build Tools** - Fixes typo causing fix for build tools to fail [#5391](https://github.com/Semantic-Org/Semantic-UI/issues/5391)

### Version 2.2.12 - Aug 07, 2017

**Major Enhancements** (1)
- **Dropdown** - Dropdown can now have `values` specified in javascript when initializing.This should simplify cases where dropdown contents are contingent on other fields, for example listing sub categories. You can see some [examples here](https://jsfiddle.net/Lb7c5dkz/) and in the [usage section of dropdown docs](https://www.semantic-ui.com/modules/dropdown.html#initializing-with-javascript-only)

**Critical Bugs** (3)
- **Dropdown** - Fixed regression that caused sub menu `dropdown` inside `ui menu` to always appear on left edge of dropdown introduced `2.2.11` [#5542](https://github.com/Semantic-Org/Semantic-UI/issues/5542)
- **Popup** - Fixed a regression with `popup` in `2.2.11` that caused popups to appear out of place in some cases due to incorrect calculation of `offsetParent` [#5549](https://github.com/Semantic-Org/Semantic-UI/issues/5549) [#5597](https://github.com/Semantic-Org/Semantic-UI/issues/5597) [#5590](https://github.com/Semantic-Org/Semantic-UI/issues/5590)
- **Build Tools** - Fixes issue with deprecated uglify setting that could cause build tools to fail with the following error:

```bash
GulpUglifyError: unable to minify JavaScript
Caused by: DefaultsError: `preserveComments` is not a supported option
```

**Enhancements** (2)
- **Dropdown** - Dropdown mutation observers now watch to see if the entire `<select>` DOM node is replaced with a different select, and not just if new `<option>` are added
- **Modal** - Modal will now take into account absolutely positioned elements inside a modal when determining if scrolling is necessary. [#5578](https://github.com/Semantic-Org/Semantic-UI/issues/5578) **Thanks @lulalala**

**Bugs** (4)
- **Dropdown** - Fixed an issue where css rule for `focused default text` was not being applied for multiselects [#5633](https://github.com/Semantic-Org/Semantic-UI/issues/5633)
- **Dropdown** - Calling dropdown methods on `<select>` will now work when using `setting` behavior to set settings after load [#3744](https://github.com/Semantic-Org/Semantic-UI/issues/3744)
- **Header** - Fixes vertical alignment
- **Header/List** - Fixes issue where icons appear slightly offset with text due to line-height offset fixes no longer being necessary in modern browsers.
- **Modal** - Fixes issue where init order matters when multiple modals are shown at same time and `allowMultiple: true` is used [#5559](https://github.com/Semantic-Org/Semantic-UI/issues/5559)


### Version 2.2.11 - July 11, 2017

**Critical Bugs** (5)
- **Dropdown** - Fixed issue where using `down` key to re-open dropdown when using `search selection dropdown` would start at the top element instead of jumping to selected element [#4506](https://github.com/Semantic-Org/Semantic-UI/issues/4506)
- **Modal** - Using multiple modals with different `inverted` `blurring` or `closable` settings will now function normally in all cases [#4368](https://github.com/Semantic-Org/Semantic-UI/issues/4368)
- **Modal** - Fixed issue where modal `refresh` was being called on modals even if they are hidden, causing display issues when multiple modals are shown. **Thanks @p2kmgcl** [#5319](https://github.com/Semantic-Org/Semantic-UI/issues/5319)
- **Form Validation** - Fixed issue where radio was not being included in `onFailure` values if not set [#5064](https://github.com/Semantic-Org/Semantic-UI/issues/5064)
- **Sticky** - Fix issue where sticky would cause page to shift when `context` height was determined by sticky's height in `position: static;`  [#3430](https://github.com/Semantic-Org/Semantic-UI/issues/3430)

**New Features** (6)
- **Dropdown** - Dropdowns will automatically detect when they are offscreen to the right and will open leftward instead **Thanks @Graveheart** [#4211](https://github.com/Semantic-Org/Semantic-UI/issues/4211)
- **Form Validation** - Added `add rule` `add field`, `remove rule`, `remove field` to programmatically and and remove validation rules from form validation [#4267](https://github.com/Semantic-Org/Semantic-UI/issues/4267) [#5253](https://github.com/Semantic-Org/Semantic-UI/issues/5253)
- **Site** - Site now includes custom styles for in-page UI scrollbars (but not actual page scrollbar) by default in WebKit/Chrome. Components with inverted content like dimmer include an inverted scrollbar.  You can disable this by setting `@useCustomScrollbars: false` in your `site.variables`
- **Modal** - Adds new `scrolling content` variation to have a modal with content that scrolls
- **Sticky** - Sticky now includes a new setting `setSize` to determine whether it should set content size on stick to the size before sticking (fixed content uses different positioning system) [#4360](https://github.com/Semantic-Org/Semantic-UI/issues/4360)
- **Reset** - Upgrades to [normalize.css 7.0](https://necolas.github.io/normalize.css/) **Thanks @ivantcholakov** [#4647](https://github.com/Semantic-Org/Semantic-UI/issues/4647)
- **Modal** - Adds `tiny` and `mini` sized modals **Thanks @Banandrew** [#5123](https://github.com/Semantic-Org/Semantic-UI/issues/5123)
- **Steps** - Steps now include an `unstackable` variation **Thanks @TemaSM** [#3714](https://github.com/Semantic-Org/Semantic-UI/issues/3714)

**Enhancements** (4)
- **Build Tools** - All Gulp/NPM dependencies have been updated to their latest versions
- **Dropdown** - Improved spacing on `image` inside `menu item` and for selected `text`
- **Popup** - Added `bind clickaway` `bind touch close` `bind close on scroll` behaviors to make it easier for `on: 'manual'` popup to specify behavior
- **Popup** - Separated className setting for `visible` into `visible` and `popupVisible`, this way you can remove visible indication on activating element without modifying popup visibility.

**Bug Fixes** (19)
- **Table**- Fix inverted table header color not applying properly to `sortable table` **Thanks @Banandrew** [#5303](https://github.com/Semantic-Org/Semantic-UI/issues/5303)
- **Dimmer** - Changing closable or inverted settings dynamically with `setting` will now modify settings correctly on next show/hide without re-initialization
- **Dropdown** - Fix dropdown arrow being slightly off center due to em calculation being incorrect due to differences in relative em
- **Dropdown** - Fix `loading dropdown` icon position being slightly offset
- **Dropdown** - Fixed issue where `search selection dropdown` would reset list to top after selection when re-opening dropdown [#4506](https://github.com/Semantic-Org/Semantic-UI/issues/4506)
- **Icon** - Changed `content icon` to use an existing alias `sidebar icon`, as it is most common use case and prevents naming collisions with `content` of elements **Thanks @philrykoff** [#4574](https://github.com/Semantic-Org/Semantic-UI/issues/4574)
- **Sidebar** - Removed use of `ios` browser detection, and use of `-webkit-overflow-scrolling: touch;`. iOS no longer has sizing issues when displaying sidebar content in latest iOS.
- **Search** - Fixed issue where `searchDelay` could cause results to appear after search had lost focus.
- **Sticky** - Fixed edge case where using `offset` setting, sticky element would not internally scroll if the rail contents (without the offset setting) would fit on screen
- **Popup** - Fixed bug where `supports svg` was not working correctly due to incorrect comparison to `undefined` **Thanks @mathiasrw** [#4544](https://github.com/Semantic-Org/Semantic-UI/issues/4544)
- **Input** - Fix issue where transparent input had a border radius and could cut off descendors [#5281](https://github.com/Semantic-Org/Semantic-UI/issues/5281)
- **Input** - Fixes disabled style being applied twice on input **Thanks @levithomason** [#5284](https://github.com/Semantic-Org/Semantic-UI/issues/5284)
- **Message** - Fix issue with `compact icon message` not appearing compact [#4759](https://github.com/Semantic-Org/Semantic-UI/issues/4759)
- **Menu** - Fixed issue where `left menu` and `right menu` did not display correctly in `stackable menu` on mobile **Thanks @BleuDiamant @Traverse** [#3604](https://github.com/Semantic-Org/Semantic-UI/issues/3604) [#5116](https://github.com/Semantic-Org/Semantic-UI/issues/5116)
- **Menu** - Fixed issue where `(x) item attached menu` was off by 1 pixel due to a css inheritance issue [#4248](https://github.com/Semantic-Org/Semantic-UI/issues/4248)
- **Popup** - Fixed issue where popup would incorrectly add itself to the wrong offset context when using `popup` and `target` setting together in cases where the `target` has a different `offsetParent` than the activating element.
- **Segment** - Fixed issue where using colored segment e.g. `red segment` inside `segments` would not work when `:first-child` [#4013](https://github.com/Semantic-Org/Semantic-UI/issues/4013)
- **Sticky** - Fixed an issue where `ui sticky` used with a percentage based width would not resize properly if the content size of container changed when "stuck" [#4360](https://github.com/Semantic-Org/Semantic-UI/issues/4360)
- **Dimmer** - Fixed typo causing body dimmer to add unnecessary `position: relative;` **Thanks @jinyangzhen** [#4707](https://github.com/Semantic-Org/Semantic-UI/issues/4707)

**Doc Fixes** (3)
- **Form** - Updated docs to include new examples of adding/removing validation rules
- **API** - Clarified in docs that all AJAX parameters can be passed to API
- **Form Validation** - Added undocumented `add prompt` to list of behaviors

### Version 2.2.10 - March 28, 2017

**Critical Bugs**
- **Dropdown** - Fix search input inside dropdown menu causing dropdown to close before selection when selecting an item #5113
- **Dropdown** - (IE11 Only) Fixed issue where dropdown re-opens immediately after closing when using a `search` inside menu. #4237

**Bugs**
- **Button** - Fixes `@basicActiveBoxShadow` being used incorrectly in basic button variables
- **Visibility** - Visibility events now fire correctly when using `context` other than body that has `overflow-x` or `overflow-y` set to `auto` or `scroll`
- **Dropdown** - Fixes an issue where dropdown would not correctly open `upward` at bottom edge of the screen when using a `context` with `overflow-x` or `overflow-y` set to `auto`
- **Modal** - `onDeny` and `onApprove` callbacks can no longer occur multiple times if you rapidly click a approve/deny button in a. #4479

**Enhancements**
-**Form** - Credit card validation now no longer fails validation with dashed credit card values #5122 **Thanks @neokio**

**Bugs**
- **Visibility** - Fixed bug where using visibility with `context` setting on a scrollable context (with overflow) would cause callbacks to fire incorrectly
- **Visibility** - Fixed bug where `top passed` and `bottom passed` would appear as incorrect values if using settings from `get element calculations` when element is off screen.

### Version 2.2.9 - February 21, 2017

**Build Tools**
- Fixes `2.2.8` npm install script failing due to incorrect path in `require` statement

### Version 2.2.8 - February 21, 2017

### Important Note
> Some quirks have been resolved that may cause changes for upgrading users who were expecting these behaviors

#### Form Validation
If you are using form validation, previous to `2.2.8` calling `is valid` would trigger UI updates. This behavior now **no longer triggers UI updates**, and will only return a `boolean` whether form is valid.

To trigger UI updates you can call `validate form`. Additional form behaviors have been added as well. [See the new documentation on programmatic validation](http://semantic-ui.com/behaviors/form.html#validating-programmatically) for more examples.

#### Dropdown
`multiple selection dropdown` no longer automatically adds the currently selected value when you "alt-tab" or blur the field, even when `forceSelection: true` is set.

-------------------------------------------------------

**Major Enhancements**
- **Icons** - Updates Font Awesome to `4.7.0` **Always the man @BreadMaker** [#4766](https://github.com/Semantic-Org/Semantic-UI/pull/4766)
- **Dropdown** - Added new setting `filterRemoteData`, when set to `true` API will be expected to return the complete result set, which will then be filtered clientside to only display matching results. **Thanks @enix223** [#4815](https://github.com/Semantic-Org/Semantic-UI/pull/4815)
- **Dropdown** - Fixed issue where using some usage of special characters like `\` could cause dropdowns to not work. [#4688](https://github.com/Semantic-Org/Semantic-UI/pull/4688) [#4692](https://github.com/Semantic-Org/Semantic-UI/pull/4692)
- **Tab** - Added setting `loadOnce`, which when enabled only calls remote endpoint for tab data on first load and leaves the DOM undisturbed afterwards. [#2534](https://github.com/Semantic-Org/Semantic-UI/pull/2534)

**Critical Bugs**
- **Dropdown** - `forceSelection` setting will no longer cause highlighted value in multiselect to be selected on blur when using a `multiple selection dropdown` [#4041](https://github.com/Semantic-Org/Semantic-UI/pull/4041) [#4516](https://github.com/Semantic-Org/Semantic-UI/pull/4516)
- **Dropdown** - Dropdown using search input inside of menu are now tabbable [#4490](https://github.com/Semantic-Org/Semantic-UI/pull/4490)
- **Search** - Fixes issue where empty results message can still appear when using setting `showNoResults: false` [#4616](https://github.com/Semantic-Org/Semantic-UI/pull/4616)
- **Sidebar** - Fixed bug where sidebar in `iOS` would show incorrect background when opening sidebar if page is less than 100% height [#4264](https://github.com/Semantic-Org/Semantic-UI/pull/4264)

**Critical Doc Fixes**
- **Visibility** - Added documentation for `onOnscreen` and `onOffScreen`, two very important callbacks that occur when an element is or isn't in currently scrolled view.

**Enhancements**
- **Items** - Added `unstackable` variation to prevent items from stacking on mobile [#2901](https://github.com/Semantic-Org/Semantic-UI/pull/2901)
- **Search** - Added new parameter `callback` to behaviors `query`, `show results`, `hide results`, and `search remote` to allow a function to be called after completion.
- **Form Validation** - Rules now properly supports identifiers with special characters like brackets, e.g. `name="user[name]"` **Thanks @mzygmunt** [#4163](https://github.com/Semantic-Org/Semantic-UI/pull/4163)
- **Search** - `esc` key now hides results and prevents them from being displayed again until form field is blurred

**Build Tools**
- **NPM** - Removed dependency on tarball, packaged new patched WrenchJS under Semantic-org [as a new package](http://github.com/semantic-org/wrench-js).

**Bugs**
- **Button** - Fixed issue where css specificity caused `icon buttons` to not center correctly [#4487](https://github.com/Semantic-Org/Semantic-UI/pull/4487)
- **Dropdown** - Fixed bug where clicking on a dropdown's `dropdown icon` when using remote data would not open menu [#4041](https://github.com/Semantic-Org/Semantic-UI/pull/4041)
- **Dropdown/Search/Checkbox** - Removes use of deprecated `dispatchEvent` DOM APIs for generating simulated events
- **Dropdown** - Fixes issue where `left pointing dropdown` and `right pointing dropdown` appear styled incorrectly when opening `upward` [#4896](https://github.com/Semantic-Org/Semantic-UI/pull/4896)
- **Dropdown** - Fixed issue where using `fullTextSearch: 'exact'` would still fuzzy search on value **Thanks @ rminnett** [#4651](https://github.com/Semantic-Org/Semantic-UI/pull/4651) [#3424](https://github.com/Semantic-Org/Semantic-UI/pull/3424)
- **Dropdown** - Fix bug where `scrolling menu` or `scrolling dropdown` would have excessive right padding by removing scrollbar width from calculation (no longer necessary in modern browsers)
- **Comments** - `small`, `large` and other comment sizes now default to global size variables.
- **Dropdown** - Fixed issue where `selectOnKeydown` with `html` content would cause only non html content to display in `text` until blur
- **Form Validation** - Fixes issue where decimal validation would allow multiple `.` in value
- **Form Validation** - Fixes js error caused by revalidating inputs without validation rules [#4497](https://github.com/Semantic-Org/Semantic-UI/pull/4497) [#4547](https://github.com/Semantic-Org/Semantic-UI/pull/4457) **Thanks @cbxp**
- **Header** - Fixed issue where using `image icon` or `image outline icon` would cause incorrect display within `ui header` due to namespace collision with `ui image` [#4145](https://github.com/Semantic-Org/Semantic-UI/pull/4145)
- **Input/Dropdown** - Fixed rounding error causing vertical alignment of `dropdown`, `search`, `input` to sometimes appear off by 1 pixel [#4279](https://github.com/Semantic-Org/Semantic-UI/pull/4279)
- **Segment** - Fixed `padded vertical segment` `very padded vertical segment` mistakenly receives horizontal padding [#3012](https://github.com/Semantic-Org/Semantic-UI/pull/3012)
- **Visibility** - Images that use `$('img').visibility({ type: 'image'})` will no longer animate a second time if re-initialized.
- **Form Validation** - Fixed issue where using bracketed values, or other special characters could cause errors with selectors [#4163](https://github.com/Semantic-Org/Semantic-UI/pull/4163) [#4164](https://github.com/Semantic-Org/Semantic-UI/pull/4164)

**Documentation**
- **Comments** - Added missing `size` variations to comments docs [#4450](https://github.com/Semantic-Org/Semantic-UI/pull/4450)
- **Typos** - Thanks to everyone who has submitted typo/grammatical PRs, much appreciated

### Version 2.2.7 - December 21, 2016

**Build Tools**
- **Autoinstall** - Fixes issue where `autoinstall: true` was not copying build files during `npm install` **Thanks @AnsonT** [#4430](https://github.com/Semantic-Org/Semantic-UI/pull/4430)
- **Dependencies** - Updates build dependencies

### Version 2.2.6 - October, 27, 2016

**Bugs**
-**Tab** - Hotfix for accidental use of ES6 `let`

### Version 2.2.5 - October, 27, 2016

**Bugs**
- **Search** - Fixed issue where pressing "up" key when no results selected would cause bottom result to be selected
- **Search** - Fixed issue where input may attempt to refocus when search element is immediately removed from browser's DOM after a result is clicked.
- **Flat Theme** - Fixes inverted input color

**Enhancements**
- **Tab** - Added new tab cache type `DOM` which preserves the final DOM state after scripts rendering. This can be used to avoid re-running returned `<script>` tags on each cached read #2534
- **Checkbox** - Adds additional variables for styling toggle checkbox on/off state
-  **Sticky** - Adds `container` setting. This can be used to specify the offsetParent of the sticky element and avoid having to calculate on initialization (improving performance)
- **Progress** - Progress now includes transitionEnd failback for progress bar animations, this will prevent labels from continuing to be updated if the `transitionEnd` css callback does not fire correctly
- **Transition** - You can now specify `data-display` to specify the final display state for an animation in cases that it is detected incorrectly (you can also pass in as a setting)

### Version 2.2.4 - August 25, 2016

**Critical Bug**
- **Search** - Fixed issue where keyboard navigation for search was broken in `2.2.3` due to regression [#4469](https://github.com/Semantic-Org/Semantic-UI/issues/4469)

**Bugs**
- **Build Tools** - Removed unnecessary `gulp-minify-css` package from deps [#4463](https://github.com/Semantic-Org/Semantic-UI/issues/4463)

**Enhancements**
- **Message** - Added additional variables for `@padding`

### Version 2.2.3 - August 21, 2016

**Enhancements**
- **Form Validation** - Bracketed notation can now be omitted for rules, instead passing in bracketed values with the `value` parameter [#3313](https://github.com/Semantic-Org/Semantic-UI/issues/3313)
- **Dropdown** - Using `search selection` with `selectOnKeydown` will now highlight the partial search matching the currently keyboard selected value
- **Modal** - Modal now includes setting to enable/disable keyboard shortcuts
- **Modal** - Modal will now focus first tabable element, not just `input` [#4370](https://github.com/Semantic-Org/Semantic-UI/issues/4370)

**Bugs**
- **Comments** - Adds missing sizes (mini, tiny etc) **Thanks @ilanus** [#4408](https://github.com/Semantic-Org/Semantic-UI/issues/4408)
- **NPM** - Fixed `package.json` to allow either jQuery `2.x` or `3.x` [#4254](https://github.com/Semantic-Org/Semantic-UI/issues/4254)
- **Button/Dropdown** - Fixed issue where `ui dropdown button` could have incorrect spacing for dropdown icon **Thanks @ilanus** [#4408](https://github.com/Semantic-Org/Semantic-UI/issues/4408)
- **Form/Segment** - Fix typo causing `pointer-events: none` no to work on `loading segment` and `loading form`  **Thanks @YamiOdymel and @ilanus** [#4403](https://github.com/Semantic-Org/Semantic-UI/issues/4403)
- **Icon** - `icons` can now receive `link` styling  **Thanks @tbracken** [#4399](https://github.com/Semantic-Org/Semantic-UI/issues/4399)
- **Button** - Fixed `vertical buttons` with only 1 button having incorrect border radius **Thanks @Denhai** [#4107](https://github.com/Semantic-Org/Semantic-UI/issues/4107)
- **Grid** - Fixed issue where `(x) aligned column` inside a `(x) aligned row` would not properly apply the `column` alignment
- **Form** - Fixed issue where `disabled fields` with radio inputs would not correctly dim the label **Thanks @louwers** [#4366](https://github.com/Semantic-Org/Semantic-UI/issues/4366)
- **Menu** - Fixed issue where `dropdown` in `vertical menu` would not correctly open `upward` when no space below **Thanks @gdaunton** [#4150 [#4156](https://github.com/Semantic-Org/Semantic-UI/issues/4156)
- **Dropdown** - Using `search selection with `selectOnKeydown` and text content that includes html, will not apply html content (like images) to the text until dropdown blur, making sure that content can align correctly with the partial search content of the search input (which cannot include HTML)
- **Dropdown** - Fixed issue where dropdown `clear` would not remove active state when `useLabels: true` and multiple dropdown **Thanks vinh123456789** [#4275](https://github.com/Semantic-Org/Semantic-UI/issues/4275) [#4366](https://github.com/Semantic-Org/Semantic-UI/issues/89**)
- **Dropdown** - `dropdown icon` no longer relies on stopping event propagation. This means using the dropdown icon will now cause other dropdowns to correctly hide. [#3998](https://github.com/Semantic-Org/Semantic-UI/issues/3998)
- **Dropdown** - Fixes `action: select` not working correctly since `2.2` due to incorrect use of new function signature. [#4183](https://github.com/Semantic-Org/Semantic-UI/issues/4183)
- **Dropdown** - Fixed typo causing selectObserver mutation observer not to disconnect **Thanks @Paklausk** [#4311](https://github.com/Semantic-Org/Semantic-UI/issues/4311)
- **Icon** - Fixed missing `dribbble` icon due to incorrect count of "b" (should be 3). [#4185](https://github.com/Semantic-Org/Semantic-UI/issues/4185)
- **Icon** - Fixes `grab icon` and `television icon` not appearing correctly [#4178](https://github.com/Semantic-Org/Semantic-UI/issues/4178)
- **Form** - `input` styles now apply to `type="file"` **thanks @coldfire79** [#4074](https://github.com/Semantic-Org/Semantic-UI/issues/4074)
- **Popup/Menu** - Fixed issue where popup would not appear correctly when nested in menu in some ways.
- **Icon** - Fixes `talk` icon not working correctly **Thanks @anantogosh** [#4354](https://github.com/Semantic-Org/Semantic-UI/issues/4354)
- **Transition** - Removed unreachable code **Thanks @basarat** [#4225](https://github.com/Semantic-Org/Semantic-UI/issues/4225)
- **Grid** - Fixed alignment in `centered justified grid** **Thanks @bretto36** [#4224](https://github.com/Semantic-Org/Semantic-UI/issues/4224)
- **Popup** - Fixed issue where `observeChanges: false` setting in popup would not prevent mutation observers

**Docs**
- **Icons** - Fixed some duplicate icons (External) and mispelled icons (Dribbble)
- **Popup** - Fixed popup in menu example

**Themes**
- **Material** - Fixed paths to `Roboto` google font to use `https` **Thanks @AndyR207** [#4051](https://github.com/Semantic-Org/Semantic-UI/issues/4051)

### Version 2.2.2 - July 07, 2016

**Bugs**
- **Shape** - Fixed issue where shape was animating incorrectly when using jQuery 3.0, due to secret changes in how `width` are calculated on elements with `transform`
- **Dropdown** - Fixed "pointer" cursor appearing in hitbox above search input in `search selection`, now all input area will appear with "text" input cursor
- **Dimmer/Modal** - Fixed a bug which could cause a modal's dimmer to not obey `inverted: true` or `blurring: true` when initializing modals with *then afterwards* without either setting.

### Version 2.2.1 - June 27, 2016

**Bugs**
- **Dropdown** - Fixed issue where using both `<select>` and `allowAdditions: true` would cause dropdown selection to fail

### Version 2.2.0 - June 26, 2016

**Project Features**
- **jQuery** - Semantic UI is now fully compatible with jQuery `3.0`
- **Webpack** - All css is now webpack-compatible
- **NPM** - NPM dependencies have all been updated to latest stable releases

**New UI Features**
- **All UI** - Added new setting `silent` to all modules which allows you to disable all console output including errors. This can be useful for preventing known errors, like a popup which cannot place itself on screen, or `sticky` content which initializes before it is visible [#3713](https://github.com/Semantic-Org/Semantic-UI/issues/3713)
- **All UI** - All UI now include _all_ sizing variations, `mini`, `tiny`, `small`, `large`, `big`, `huge`, `massive`. Headers remain with only 5 sizes `small-huge` to match `H1-H5`
- **All UI** - Components that use event handlers on `document`, `body`, or a `settings.context` now all use DOM mutation observers to detect removal and prevent memory leaks
- **Button** - Added compatibility with `primary` `secondary` `positive` `negative` buttons with the `basic` styling variation. [#3756](https://github.com/Semantic-Org/Semantic-UI/issues/3756)
- **Card** - Added `raised` card variation **Thanks @yordis** [#2955](https://github.com/Semantic-Org/Semantic-UI/issues/2955)
- **Dropdown** - All dropdowns, not just `selection dropdown`, will now select the first `menu item` that starts with a pressed keyboard key, for example "N" will select "New"
- **Dropdown** - Dropdown now changes user selection on keyboard shortcuts immediately, this will save the extra `enter` key press to confirm selection in most cases. To enable previous pre `2.2` selection style use the setting `selectOnKeydown: false`
- **Dropdown** - Dropdown will now automatically focus on `search` inside of a dropdown menu after it is opened.
- **Dropdown** - Multiple select dropdown now sizes current dropdown input based on rendered width of a hidden element, not using an estimate based on character count. This means search will never break to a second line earlier than would normally fit in current line.
- **Icons** -  Icons now use the latest Font Awesome `4.6.3` Icons. 80+ new icons+ are included. Thanks @BreadMaker for the PR and @davegandy for the font!
- **Popup** - Added new `tooltip` popup type that works without javascript. Tooltips can specify positioning and some variations using `data` attributes, and will handle positioning automatically with CSS only.
- **Progress** - Progress now uses a polling interval for updates. Rapidly updating the progress bar over a period quicker than the animation duration (for example with xhr `onprogress` events say every 50ms) will now appear smooth as butter.
- **Table** - `definition table` now includes additional class names for forcing, or ignoring definition cell styles

**New Settings**
- **Build Tools** - Added new `autoInstall` option to allow for Semantic to be installed without user interaction. See [docs explanation](http://www.semantic-ui.com/introduction/advanced-usage.html[#Auto](https://github.com/Semantic-Org/Semantic-UI/issues/Auto)-Install) for how to use. [#3616](https://github.com/Semantic-Org/Semantic-UI/issues/3616) **Thanks @algorithme**
- **Dropdown** - Added `fullSearchSearch: 'exact'` setting, which requires exact matches for dropdown values [#3085](https://github.com/Semantic-Org/Semantic-UI/issues/3085) [#3994](https://github.com/Semantic-Org/Semantic-UI/issues/3994) **Thanks @ShawnCholeva**
- **Dropdown** - Added new setting for search selection `hideAdditions` this will remove showing user additions inside the menu, making for a more intuitive adding process. Dropdowns now have a new state `empty` which will format an active dropdown with empty results. [#3791](https://github.com/Semantic-Org/Semantic-UI/issues/3791)
- **Dropdown** - Adds new `allowReselection` option to trigger `onChange` events even when reselecting same value
- **Dropdown** - Adds new setting `minCharacters` which sets the minimum number of characters required to start filtering results [#3886](https://github.com/Semantic-Org/Semantic-UI/issues/3886)

- **Form Validation** - Added `depends` validation rule setting which will only validate a field if another specified field is not empty
- **Popup** - Added new setting `boundary` and `scrollContext`. `boundary` lets you specify an element that the popup will try to position itself to be contained inside of. `scrollContext` lets you specify the element which when scrolled should hide the popup
- **Popup** - Added new settings `observeChanges`, which is enabled by default. This will add special mutation observers to trigger `destroy` when the element is removed from the document, preventing memory leaks.
- **Progress** - Added `onLabelUpdate` callback, this can be used to specify the exact text that should appear on the actual progress update, perhaps based on some external conditions
- **Rating** - Added new setting `fireOnInit` for rating, which defaults to `false`. When set to true `onRate` will fire when rating is initialized [#3712](https://github.com/Semantic-Org/Semantic-UI/issues/3712)
- **Search** - Added a new option `selectFirstResult`, which defaults to `false`. Will automatically highlight first result on search
- **Search** - Search now includes a `showNoResults` setting for determining whether no results messages should be shown
- **Shape** - Shape now lets you specify next side width using setting `width`, can use `next` or `initial` to specify whether it should use old or new side size
- **Tab** - Added new setting `cacheType`, can either be `html` or `response` (default). HTML will cache resulting html after callbacks, `response` will cache the original response so that it can be played back identically on future loads [#2534](https://github.com/Semantic-Org/Semantic-UI/issues/2534)
- **Tab** - Added new option `deactivate`, defaults to `siblings` which will only deactivate tab activators that are DOM siblings elements to the activating element. Setting it to <code>'all'</code> will deactivate any other tab element initialized at the same time.
- **Visibility** - Added `onFixed` and `onUnfixed` callbacks for visibility `type: 'fixed'`
- **Visibility** - Added `onLoad` and `onAllLoaded` callback for `type: 'image'` visibility
- **Visibility** - Added `zIndex` setting for specifying zindex with `type: 'fixed'` [#3370](https://github.com/Semantic-Org/Semantic-UI/issues/3370)

**New Behaviors**
- **Dropdown** - Added new convenience method `restore placeholder text`
- **Image** - `transition hidden image` now shows correctly as `visibility: hidden;` and not `display: none`. This will allow `offset` with `visibility` and `sticky` to work more seamlessly. `hidden image` will still remain `display: none;`
- **Progress** - Added progress `is complete` for returning whether success, warning, or error conditions are met

**CSS Enhancements**
- **All UI** Extended variables which return exact pixel values in em (`@relativePX` and @px) up to 64px to allow for simple theming with exact values
- **Button** - Added variables for configuring `disabled` background image and box shadow.
- **Site** - Added colored box shadow defaults. `ui message` now includes individual colored border shadows based on new site defaults.
- **Site** - Added new `@inputColor` and `@inputPlaceholderColor` global variables that now control placeholder text styles across all components.
- **Table** - `definition table` now supports `definition` variation to specify definition styles on an element that is not `:first-child`
- **Table** - `definition table` now supports `ignored` variation to force a `first-child` to ignore its default definition stylings

**Critical Bug Fixes**
- **All UI** - Using `component('setting, {})` to add multiple settings as an object literal, for example `error: {}`, will now deep extend the existing object instead of replacing it.
- **API** - `beforeSend` would not correctly cancel request when `return false;` is used in callback. [#3660](https://github.com/Semantic-Org/Semantic-UI/issues/3660)
- **API** - `cache: 'local'` would not return the localstorage cached results in some cases
- **Divider** - Descenders like "g" are cut off in `horizontal divider` [#3585](https://github.com/Semantic-Org/Semantic-UI/issues/3585)
- **Dropdown** - `forceSelection` will now automatically select values with multi dropdowns. When using `userAdditions` setting it will now automatically tokenize the current entered value
- **Dropdown** - `search selection` would not let you move back in an entered search string with left arrow [#3596](https://github.com/Semantic-Org/Semantic-UI/issues/3596) **Thanks @Sanjo**
- **Dropdown** - Fixed issue where value set using javascript DOM metadata would be cleared when a message or user addition triggered `refresh` [#3879](https://github.com/Semantic-Org/Semantic-UI/issues/3879) [#3622](https://github.com/Semantic-Org/Semantic-UI/issues/3622) **Thanks @mdehoog**
- **Form Validation / Dropdown** - Using "enter" key in a `search dropdown` could cause a form to be submitted [#3676](https://github.com/Semantic-Org/Semantic-UI/issues/3676)
- **Form Validation** - Fix issue with some foreign email addresses with extended charsets causing email validation to fail [#3955](https://github.com/Semantic-Org/Semantic-UI/issues/3955) [#3755](https://github.com/Semantic-Org/Semantic-UI/issues/3755)
- **Form Validation** - Revalidating a field `on: blur` could cause fields not yet interacted with to be validated [#3606](https://github.com/Semantic-Org/Semantic-UI/issues/3606)
- **Form** - Fixed issue with `(x) fields` and `equal width` fields where middle rows would be slightly smaller because they include both left and right padding in % width. (Edges only have one side padding). Field groups now use negative margins instead.
- **Popup** - Fixed issue where clicking element inside popup removed from DOM (like clicking a multi select label) would cause popup to close [#3887](https://github.com/Semantic-Org/Semantic-UI/issues/3887)
- **Rail** - Fixed incorrect width for `close rail` and `very close rail` caused by variable addition with mixed units `px` + `em` [#3835](https://github.com/Semantic-Org/Semantic-UI/issues/3835)
- **Search** - Fixed bug where a previously XHR query could cause the next one to fail depending on the latency of the request [#2779](https://github.com/Semantic-Org/Semantic-UI/issues/2779)
- **Search** - Fixed an issue where `onResult` returning `false` would not prevent the search menu from hiding. Clicking on an empty results message will also no longer close the search results. [#3856](https://github.com/Semantic-Org/Semantic-UI/issues/3856) [#3870](https://github.com/Semantic-Org/Semantic-UI/issues/3870)
- **Sticky/Visibility** -  Added mutation observer to teardown element with `destroy` if removed from DOM context, fixing a possible memory leak
- **Video** - Fixed issue with `.video('change')` behavior not properly changing video.

**Bugs**
- **API** - Using `onResponse` with `dataType` other than JSON or JSONP would cause an error. (Not allowing plain text responses to be translated) [#3653](https://github.com/Semantic-Org/Semantic-UI/issues/3653)
- **Build Tools** - Fixed gulp help text incorrect for RTL tasks in build tools [#3858](https://github.com/Semantic-Org/Semantic-UI/issues/3858)
- **Button** - `right icon` like `right arrow icon` would have additional margin inside an `icon button` [#3525](https://github.com/Semantic-Org/Semantic-UI/issues/3525)
- **Button** - Fixed issue where `disabled loading button` would not remove `pointer-events` [#2933](https://github.com/Semantic-Org/Semantic-UI/issues/2933)
- **Button** - Fixed typo in `green inverted button` [#3873](https://github.com/Semantic-Org/Semantic-UI/issues/3873)
- **Button/Dropdown** - Button dropdowns using `default text` no longer receive incorrect font styling for placeholder text
- **Checkbox** - Fixed issue where docs refer to `onEnable` and `onDisable` with checkbox but callback was called `onEnabled` and `onDisabled`, both callbacks will now be valid until 3.0 [#3761](https://github.com/Semantic-Org/Semantic-UI/issues/3761) [#3763](https://github.com/Semantic-Org/Semantic-UI/issues/3763)
- **Checkbox** - Radio buttons received `indeterminate` styles when user has not yet interacted with the page in Chrome
- **Dropdown** - `apiSettings` was not defaulting to use `cache: 'local'` as specified in the docs
- **Dropdown** - `get value` would not return correct value when value was blank [#3766](https://github.com/Semantic-Org/Semantic-UI/issues/3766)
- **Dropdown** - Added `1px` offset for current text so that the blinking text position cursor does not overlap first pixel of underlayed text.
- **Dropdown** - Dropdown would open when an label delete x was clicked when not using `search selection` [#3789](https://github.com/Semantic-Org/Semantic-UI/issues/3789)
- **Dropdown** - Dropdowns no longer re-open on selection when nested inside of a `<label>` [#3917](https://github.com/Semantic-Org/Semantic-UI/issues/3917)
- **Dropdown** - Dropdowns with sub-menus would not properly activate on mobile [#3183](https://github.com/Semantic-Org/Semantic-UI/issues/3183)
- **Dropdown** - Fixed bug where using `action: 'hide'` could cause `text` value not to be passed to `onChange` callback
- **Dropdown** - Fixed issue where values with `"` (double quotes) would not work with a dropdown using a select, because value would not be encoded as html entities
- **Dropdown** - Long dropdown text entry with `allowAdditions` would cause input to mistakingly drop to next line early [#3743](https://github.com/Semantic-Org/Semantic-UI/issues/3743)
- **Dropdown** - Regenerated dropdown will no longer ignore `disabled` property [#4010](https://github.com/Semantic-Org/Semantic-UI/issues/4010) **Thanks @eymengunay!**
- **Dropdown** - Search selection would lose search input focus when clicking on a choice [#3790](https://github.com/Semantic-Org/Semantic-UI/issues/3790)
- **Embed** - `API` setting is now disabled by default
- **Form Validation** - Fixed issue where initializing form multiple times would not properly call `destroy` removing previous settings [#3798](https://github.com/Semantic-Org/Semantic-UI/issues/3798)
- **Form** - Fix `equal width fields` sometimes not including right field spacing on mobile [#3913](https://github.com/Semantic-Org/Semantic-UI/issues/3913)
- **Form** - Fixed issue where `inline` field was not being correctly inverted in color with `inverted form` [#4004](https://github.com/Semantic-Org/Semantic-UI/issues/4004) [#4005](https://github.com/Semantic-Org/Semantic-UI/issues/4005) **Thanks @tbracken**
- **Form** - Grouped `fields` and `field` would cause different margin collapse, making `fields` include larger gaps between content [#3717](https://github.com/Semantic-Org/Semantic-UI/issues/3717)
- **Form** - Remove deprecated `size()` method in `prompt` [#3655](https://github.com/Semantic-Org/Semantic-UI/issues/3655) **Thanks @SimonArdrey**
- **Grid** - `centered` content would cause `justified` content to appear aligned left. [#3496](https://github.com/Semantic-Org/Semantic-UI/issues/3496)
- **Grid** - Fixed issue where `vertically divided` grid would have top margin in first `row` group
- **Icon** - Sizes smaller tham `small` were using with `rem` [#3782](https://github.com/Semantic-Org/Semantic-UI/issues/3782)
- **Input** - Fixed `:active` styles appearing on disabled input, when input is disabled using `disabled` property [#3907](https://github.com/Semantic-Org/Semantic-UI/issues/3907)
- **Input** - Fixes issue with `dropdown` or button on the left side of an `action` input not properly rounding
- **Label** - Fixed margin when `right floated` element precedes a `top attached label`
- **List** - `relaxed` and `very relaxed` lists included unnecessary padding on the first and last items [#3710](https://github.com/Semantic-Org/Semantic-UI/issues/3710)
- **List** - Bullets would be affected by font weight, or whether the list item was a link [#3715](https://github.com/Semantic-Org/Semantic-UI/issues/3715) [#3721](https://github.com/Semantic-Org/Semantic-UI/issues/3721)
- **List** - Divided lists had unnecessary padding on first and last items, in both horizontal and vertical layouts [#3710](https://github.com/Semantic-Org/Semantic-UI/issues/3710)
- **Menu** -  `stackable` menu with `left/right` `menu` or `item` would incorrectly be floated when stacked. [#3604](https://github.com/Semantic-Org/Semantic-UI/issues/3604)
- **Menu** - `tabular menu` now has correct bottom margin [#4167](https://github.com/Semantic-Org/Semantic-UI/issues/4167)
- **Menu** - `@dividerSize` was not being used in `vertical menu` [#3781](https://github.com/Semantic-Org/Semantic-UI/issues/3781)
- **Menu** - `vertical text menu` no longer includes `left` or `right` padding, but will now sit flush with content.
- **Message** - Fixes `compact message` appearing as `block` when inside a `form` [#3343](https://github.com/Semantic-Org/Semantic-UI/issues/3343) **Thanks @bcroq**
- **Modal** - RGB values set for dimmer `background-color` were not being correctly interpreted [#3665](https://github.com/Semantic-Org/Semantic-UI/issues/3665) **Thanks @larsbo**
- **Modal/Dimmer** - Fixed issue with `destroy` not properly removing events from dimmer [#3200](https://github.com/Semantic-Org/Semantic-UI/issues/3200)
- **Popup** - checking `instanceof SVGGraphicsElement` caused error in IE11 [#3043](https://github.com/Semantic-Org/Semantic-UI/issues/3043)
- **Progress** - Progress `onSuccess`, `onError`, and `onWarning` callbacks now occur **after** the animation completes for the state change.
- **Rating** - Fixed `ui rating` to not used outlined star in basic variation, instead using a lighter filled in star for increased visibility [#3730](https://github.com/Semantic-Org/Semantic-UI/issues/3730)
- **Rating** - rating does not fire `onRate` when rating is initialized [#3712](https://github.com/Semantic-Org/Semantic-UI/issues/3712)
- **Search** - Added `refresh` behavior for search to refresh selector cache. Cache will automatically refresh after API results received
- **Search** - Fixed issue where `href` was not pulling correctly on search click when the `result` was an `a` itself. [#3409](https://github.com/Semantic-Org/Semantic-UI/issues/3409)
- **Segment** - Fixed `segments` to not clip border radius when only a **single** segment is included
- **Segment/Message** - `top attached message` has no border when attached to `segment` [#3619](https://github.com/Semantic-Org/Semantic-UI/issues/3619)
- **Statistic** - statistic receives incorrect size when using `tiny` `large` etc inside a statistic group [#3116](https://github.com/Semantic-Org/Semantic-UI/issues/3116)
- **Step** - Fix incorrect bottom margin on `top attached steps`
- **Table** - `striped selectable` table would not correctly show hover color on striped rows
- **Visibility** - Using `type: fixed` will now correctly remove all special classes and placeholder content on `destroy` [#3548](https://github.com/Semantic-Org/Semantic-UI/issues/3548)

**Changes**
- **Sizing** - `mini` the smallest size has been modified to align to `11px` instead of previous `10px` at base em size

**Docs**
- **Progress** - Added new examples to progress
- **Progress** - Added all available behaviors with progress
- **Form** - Added example of using custom rules with form
- **Build Tools** - Added explanation of using SUI with CI, and auto-install in "recipes" section.
- **Build Tools** - Added explanation of how to build RTL in "recipes" section
- **Layouts**  - Added "attached" example showing content attached to other content

### Version 2.1.8 - Jan 7, 2016

**Critical Fix**
- **Install** - This fixes a regression causing users with NPM `2` from using Semantic UI, caused by removing the deprecated `peerDependencies` which are necessary for NPM2 install to function correctly. [#3511](https://github.com/Semantic-Org/Semantic-UI/issues/3511)

**Minor Fix**
- **Flag** - Adds Scotland and Wales flag [#3494](https://github.com/Semantic-Org/Semantic-UI/issues/3494) **Thanks @edumucelli**
- **Install** - Fixes post-install scripts not exiting with correct return values [#3515](https://github.com/Semantic-Org/Semantic-UI/issues/3515) **Thanks @Jeff-Tian**

### Version 2.1.7 - Dec 19, 2015
[Closed Issues List](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.1.7+is%3Aclosed)

**Enhancements**
- **API** - All responses fulfilled with settings (like `mockResponse`) will now receive a settings object with all values resolved. For example `url` will be `/user/2/` and not `user/{id}` in the callback. - [#3466](https://github.com/Semantic-Org/Semantic-UI/issues/3466)
- **API** - API now allows the use of settings `response` and `responseAsync` to replace `mockResponse` and `mockResponseAsync`. The use of "mock" may not represent the most common use case which is providing a response from a third party source. (These changes are purely cosmetic and no underlying behavior has changed) - [#3491](https://github.com/Semantic-Org/Semantic-UI/issues/3491)
- **Popup** - Adds `onUnplaceable` callback when element cannot be placed in visible screen [#3388](https://github.com/Semantic-Org/Semantic-UI/issues/3388)

**Bug Fixes**
- **Build Tools** - CSS build will now correctly call callback after both packaged files are created (compressed and uncompressed) Thanks @youngjay [#3405](https://github.com/Semantic-Org/Semantic-UI/issues/3405)
- **Flag** - A flag with no country set will no longer display an incorrect country flag. Thanks @space-alien [#3333](https://github.com/Semantic-Org/Semantic-UI/issues/3333)
- **Form** - Fixed issue where text would turn transparent inside a `loading form` [#3122](https://github.com/Semantic-Org/Semantic-UI/issues/3122)
- **Menu** - Fixed `1px` offset when `attached segment` follows `tabular menu` (max of 2 consecutive segments) [#3479](https://github.com/Semantic-Org/Semantic-UI/issues/3479)
- **Header** - `sub header` used inside a header now correctly forces `block` styling [#3020](https://github.com/Semantic-Org/Semantic-UI/issues/3020)
- **Popup** - Fixed `is visible`, `is animating`, and `is fluid` to always return `true/false` and not the DOM element. [#2781](https://github.com/Semantic-Org/Semantic-UI/issues/2781)
- **Popup** - Fixed issue with `onEnable` callback being defined with name `onEnabled` and `onDisable` with `onDisabled` in default settings, causing an error. To preserve backwards compatibility, the misspelled callback name has been left, but the bug has been fixed. [#3148](https://github.com/Semantic-Org/Semantic-UI/issues/3148)
- **Search** - Search now correctly hides menu when an error message inside results is clicked. [#3039](https://github.com/Semantic-Org/Semantic-UI/issues/3039)
- **Sidebar** - Fixed css rule issue causing `very thin` sidebar to not work [#3300](https://github.com/Semantic-Org/Semantic-UI/issues/3300)
- **Sidebar** - Sidebar no longer includes `transform` rules on child elements, this was causing layout issues in some cases (for example dropdowns in sidebars) [#3306](https://github.com/Semantic-Org/Semantic-UI/issues/3306)
- **Sticky** - Renames variables used to account for scroll offset internally for greater code clarity
- **Transition** - Fixes `noAnimation` error to more reasonably announce that the element is "not in the DOM" [#3040](https://github.com/Semantic-Org/Semantic-UI/issues/3040)

### Version 2.1.6 - Nov 6, 2015

**Bug Fixes**
- **Checkbox/Dropdown/Search** - Fixed issue where dropdown/checkbox `change` events were not bubbling. (Dispatched events were swapped to use native `document.creatEvent` in `2.1.5` unfortunately the flag to bubble events was mistakenly off.)

### Version 2.1.5 - Nov 1, 2015

**Docs Enhancements**
- **Examples** - All code examples now have a "copy to clipboard" button **Thanks @xiwc and @zenorocha for clipboard.js**

**Minor Enhancements**
- **Form** - Adds `equal width form` and `equal width fields` for simpler grouped fields
- **Modal** - `onHide` callback can now cancel event by returning false [#3168](https://github.com/Semantic-Org/Semantic-UI/issues/3168) **Thanks @mdehoog**
- **Dropdown** - Added `onLabelRemove` callback that allows value removal to be cancelled by callback **Thanks @goloveychuk**
- **Table** - Added `selectable` on table cell, allowing for full table-cell links
- **Popup** Added three new variables for `arrow` background color based on position, top, center or bottom. This makes it easier to use gradient backgrounds with popups and still match arrow colors.
- **Popup** - Added behaviors `get popup` and `change content` to more easily determine popup from activating element and change text

**Major Bug Fixes**
- **Checkbox/Dropdown/Search** - Fixed issue where using `.trigger('change')` would not fire native `change` event. Only triggering event handlers attached with jQuery [#3108](https://github.com/Semantic-Org/Semantic-UI/issues/3108)
- **Transition** - Fixed bug where static transitions (those that dont animate in/out of view) would not fire `onComplete` event
- **Sticky** - Fixes bug where sticky would stick at incorrect times when using a different scroll container than `body` and scrollTop is not 0 on page load.

**Bugs**
- **Divider/Step/Modal/AD** - Fixes 1px jump at `@mobileBreakpoint` caused by incorrect edge conditions in media query [#3180](https://github.com/Semantic-Org/Semantic-UI/issues/3180) **Thanks @mdehoog**
- **Dimmer** - Dimmer can now works correctly with `opacity: 0` [#3167](https://github.com/Semantic-Org/Semantic-UI/issues/3167) **Thanks @mdehoog**
- **Dropdown** - Fixed condition where focusing on dropdown would show a blank menu when "no results" was reached and the dropdown was refocused
- **Dropdown** - Search dropdowns will now correctly filter by current search term on re-focus
- **Dropdown** - Fixed issue where tabindex was being removed incorrectly with `selection dropdown` in some cases. [#3002](https://github.com/Semantic-Org/Semantic-UI/issues/3002)
- **Dropdown** - Added `remoteValues` as a possible `field` setting. Allowing users to return API results using arbitrary JSON object groupings. [#3080](https://github.com/Semantic-Org/Semantic-UI/issues/3080)
- **Dropdown** - Added ability to pass in `keys` as a setting, to avoid issues with languages where comma delimiter may be a different keycode [#3016](https://github.com/Semantic-Org/Semantic-UI/issues/3016)
- **Dropdown** - `search dropdown` will now initialize with `autocomplete="off"` to avoid triggering native autocomplete menu
- **Form Validation** - Fixes error on `blur` or `change` when using a blank validation object [#3131](https://github.com/Semantic-Org/Semantic-UI/issues/3131) **Thanks @listepo**
- **Form Validation** - Fixes some issues with form integer validation [#3053](https://github.com/Semantic-Org/Semantic-UI/issues/3053) **Thanks @maturano**
- **Form Validation** - `decimal` rule now **only matches decimals**, to match any number use `number` rule. [#3060](https://github.com/Semantic-Org/Semantic-UI/issues/3060)
- **Form** - Removed `divider` spacing as part of `ui form`, this caused inheritance issues when using special divider types [#3092](https://github.com/Semantic-Org/Semantic-UI/issues/3092)
- **Grid** - Fixes attached segment 1px offset inside grid column [#3226](https://github.com/Semantic-Org/Semantic-UI/issues/3226)
- **Grid** - Fixes some inconsistencies with `widescreen only` class [#3161](https://github.com/Semantic-Org/Semantic-UI/issues/3161) **Thanks @mdehoog**
- **Header** - Sub headers now force `display: block` [#3020](https://github.com/Semantic-Org/Semantic-UI/issues/3020)
- **Popup** - Fixes positioning issue when `movePopup: false` [#3213](https://github.com/Semantic-Org/Semantic-UI/issues/3213) **Thanks @parisholley**
- **Popup** - Popup now works with `svg` elements [#3043](https://github.com/Semantic-Org/Semantic-UI/issues/3043)
- **Progress* - Calling `reset` will now reset `value` to 0, so increment starts again at 0
- **Search** - Fixes `onSearchQuery` not firing when results are cached **Thanks @mnquintana**
- **Search** - Fixes `url` parameter not working correctly due to typo in source **Thanks @fabienb4**
- **Segment** - Fixes border on `horizontal segment` when they are `:first-child` inside `segments` group
**Docs Bugs**
- Thanks to everyone who has submitted PRs for typos, grammatical changes. These are too numerous to count, but really help improve the quality of our docs.
- **Progress** - Progress example code no longer shows accidental inline css
- **Sticky** - Fixed issue where pressing home/end button would cause sticky to break due to internal logic not allowing immediate jump from bottom attached to top attached, experienced most likely when pressing "home" or "end" key [#3011](https://github.com/Semantic-Org/Semantic-UI/issues/3011)

### Version 2.1.4 - Sep 13, 2015

**Critical Bugfixes**
- **Build** - Fixed issue where using a packaged theme without a `site.variables` would cause build to fail [#3009](https://github.com/Semantic-Org/Semantic-UI/issues/3009) [#3010](https://github.com/Semantic-Org/Semantic-UI/issues/3010)

**Enhancements**
- **Form Validation** - Form validation now supports a brand new shorthand which is drastically simpler to specify [#2579](https://github.com/Semantic-Org/Semantic-UI/issues/2579)
```javascript
// expands out using default prompts and identifier matching property label
$('.ui.form')
  .form({
    fields: {
      name     : 'empty',
      gender   : 'empty',
      username : 'empty',
      password : ['minLength[6]', 'empty'],
      skills   : ['minCount[2]', 'empty'],
      terms    : 'checked'
    }
  })
;
```
- **Form Validation** - `identifier` and `prompt` are now optional for all form validation rules. Default prompt values have been added for all rule types, and identifier will now automatically match on the named value for rule if no ID is specified. [#3001](https://github.com/Semantic-Org/Semantic-UI/issues/3001) [#2579](https://github.com/Semantic-Org/Semantic-UI/issues/2579)
- **Form Validation** - All form prompts now support templates values, `{value}`, `{name}`,  `{ruleValue}`, and `{identifier}` [#3001](https://github.com/Semantic-Org/Semantic-UI/issues/3001)

**Bugfixes**
- **Dropdown** - Fixed issue with ',' key not being allowed in dropdown due to user tagging shortcut key [#3016](https://github.com/Semantic-Org/Semantic-UI/issues/3016)
- **Message** - `ui list` used inside `ui message` now aligns properly in all conditions [#2958](https://github.com/Semantic-Org/Semantic-UI/issues/2958)
- **Form Validation** - Validation messages in `error message` group are now correctly removed when invalid field revalidates on blur
- **Label** - Labels no longer force single line using `word-wrap: nowrap` [#3006](https://github.com/Semantic-Org/Semantic-UI/issues/3006)
- **Table** - Fixed issue where `(x) column segment table` was inheriting accidentally inheriting some grid styles
- **Grid** - Fixed `middle aligned grid` not applying to columns [#2959](https://github.com/Semantic-Org/Semantic-UI/issues/2959)
- **Menu** - Fixed issue where `right menu` was not floating correctly inside a `menu > container` on mobile [#2969](https://github.com/Semantic-Org/Semantic-UI/issues/2969)
- **Button** - Fixes `right labeled icon button` with a `right` named icon (for example `right arrow`) having incorrect margin on icon. [#2973](https://github.com/Semantic-Org/Semantic-UI/issues/2973)

### Version 2.1.3 - Sep 03, 2015

**Bugfixes**
- **Embed** - Fixes issue with `?=` appearing before parameters instead of `?` [#2956](https://github.com/Semantic-Org/Semantic-UI/issues/2956) **Thanks @AgentShark**
- **Input** - Fixes regression where `ui icon input` inside forms were not correct width [#2953](https://github.com/Semantic-Org/Semantic-UI/issues/2953)
- **Input** - Fixes typo in focused placeholder text color preventing the value from being used [#2939](https://github.com/Semantic-Org/Semantic-UI/issues/2939)
- **Input** - `action input` now correctly show focused border on button side, and avoids duplicating borders

### Version 2.1.2 - Sep 02, 2015

**Bugfix**
- **Form Validation** - Fixes callbacks on `onSuccess` so as to not break backwards compatibility. #2945 #2944

### Version 2.1.1 - Sep 02, 2015

**Bugfix**
- **Build Tools** - Fixes [issue](https://github.com/Semantic-Org/Semantic-UI/commit/3d20d5e9796e05cc100af73370173f3383cf1d81) causing comment banner to incorrectly show version `2.0.7` in `dist/`

### Version 2.1.0 - Sep 02, 2015

#### Features

**New UI Features**

- **API** - Added `encodeParameters` option to enable/disable parameters being encoded with `encodeURIComponent` [#2752](https://github.com/Semantic-Org/Semantic-UI/issues/2752)
- **API** Added new setting `hideError`, defaults to `auto` (will automatically hide error for elements that are not forms). [#2586](https://github.com/Semantic-Org/Semantic-UI/issues/2586)
- **Build Tools** - Packaged `.overrides` file are now an optional include
- **Button** - `colored basic` button are now colored before `:hover` in the default theme, this is more in line with common usage across other websites.
- **Button** - Added `labeled button` variation for display a count next to a button.
- **Cards** - Added documentation for `stackable` cards which was available but undocumented in previous versions.
- **Checkbox** - Added 4 new callbacks `beforeChecked`, `beforeUnchecked`, `beforeDeterminate`, `beforeIndeterminate`. You can now cancel a state change by returning false from these callbacks.
- **Divider** - Vertical divider can now be used multiple times in a single column row (not just 50/50 split). [#2808](https://github.com/Semantic-Org/Semantic-UI/issues/2808)
- **Dropdown**  - Dropdown using remote data, can now customize the property names returned by api call using `fields` (similar to search).
- **Dropdown** - Dropdown will now automatically update selected values when hidden input value changes (so long as `change` event is triggered) [#2626](https://github.com/Semantic-Org/Semantic-UI/issues/2626)
- **Dropdown** - Dropdown with user additions now will use custom templated messages to distinguish added choice from preselected choice [#2923](https://github.com/Semantic-Org/Semantic-UI/issues/2923)
- **Form Validation** - Added credit card validation, supports array of card types, and international cards including non luhn cards like China UnionPay [#2729](https://github.com/Semantic-Org/Semantic-UI/issues/2729)
- **Form Validation** - Updated appearance of form validation prompts to use a more lightweight style. Added variables for controlling error validation prompt styles in `form.variables`
- **Grid** - Added new responsive [`reversed`](http://www.semantic-ui.com/collections/grid.html#responsive-order) variations for reversing column order, these are also compatible with other grid types like `divided` and `celled` by device [#2685](https://github.com/Semantic-Org/Semantic-UI/issues/2685)
- **Icon** - Added `fitted` icon variation, and new small sizes `tiny` and `mini`
- **Input** - Added `disabled` state for inputs [#2694](https://github.com/Semantic-Org/Semantic-UI/issues/2694)
- **Input** - Added ability for labeled input to be attached to both sides [#2922 **Thanks @maturano**](https://github.com/Semantic-Org/Semantic-UI/issues/no**)
- **Label** - Added a new  `basic label` style, works symbiotically with other label types to provide a more lightweight style label
- **Menu** - Added new `tabular` menu types, `right tabular`, `bottom tabular`, added many new `tabular` menu variables for customizing
- **Menu** - Appearance of `labeled icon menu` has been modified. Horizontal menus now have icons above text, and icons are slightly larger than before.
- **Search** - Search now can use any server response mapping, use the `fields` parameter to pass in a mapping of server response to content **thanks @anibalmf1** [#2645](https://github.com/Semantic-Org/Semantic-UI/issues/2645)
- **Site** - Added global variable `@focusedFormBorderColor` for controlling form focus border color
- **Table** - New `fixed` table variation added for use with `table-layout: fixed;`. This also supports "..." ellipsis when used with `single line` content

**[Additional Features](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.1.0+is%3Aclosed)**
- **Breadcrumb** - Breadcrumb no longer receives vertical spacing by default. This may often cause vertical alignment issues when displayed next to other `inline-block` content.
- **Dropdown** - Added `get default text` and `get placeholder text` behaviors for returning text values.
- **Dropdown** - Pointing dropdown (dropdown with arrows) now support `upward`, and will automatically move pointer arrows when appearing upward [#2733](https://github.com/Semantic-Org/Semantic-UI/issues/2733)
- **Form** - `inverted form` now remove input border, added new variables for controlling inverted form input styles
- **GitHub Theme** - Added github icon theme with port of Octicons.
- **Label** - Added `basic` label variation, useful for item counts
- **Menu** - `inverted menu` now support `colored` individual items **Thanks @maturano** [#2850](https://github.com/Semantic-Org/Semantic-UI/issues/2850)
- **Menu** - `text menu` now uses padding for hitboxes to make target area for links larger

**[Community Added Features](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.1.0+is%3Aclosed)**
- **Build Tools** - `gulp build` now correctly calls `callback`, allowing those importing tasks to chain it correctly [#2836 **Thanks @artemkaint**](https://github.com/Semantic-Org/Semantic-UI/issues/nt**)
- **Dropdown** - Dropdown `show` and `hide` are now cancellable by returning `false` from `onShow` or `onHide` callbacks.
- **Flag** - England flag alias is now correctly set [#2770 **Thanks @eduardom**](https://github.com/Semantic-Org/Semantic-UI/issues/om**)
- **Form Validation** - Added `number` and `decimal` validations to form **Thanks @TonnyORG** [#2537](https://github.com/Semantic-Org/Semantic-UI/issues/2537)
- **Form Validation** - Form `onSuccess` and `onFailure` now receive current form fields as a parameter **Thanks @guodong**
- **Popup** - Popup will now look for inline popup as any next adjacent sibling [#2772 **Thanks @malacalypse**](https://github.com/Semantic-Org/Semantic-UI/issues/se**)

#### Bugs
**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.1.0+is%3Aclosed)**
- **Accordion** - Added missing notation for accordion docs [#2812](https://github.com/Semantic-Org/Semantic-UI/issues/2812)
- **Build Tools** - Fixed bug where `gulp version` would show `x.x` [#2875 [#2920](https://github.com/Semantic-Org/Semantic-UI/issues/2920)
- **Build Tools** - Fixes issue where component glob `{tab, table}` caused table to be included twice in concatenated source **
- **Button** - Fixes inverted button missing an `active` and `active focus` state [#2635](https://github.com/Semantic-Org/Semantic-UI/issues/2635)
- **Button** - Fixes issue where `basic button` would not have focus color text when colored [#2264](https://github.com/Semantic-Org/Semantic-UI/issues/2264)
- **Checkbox** - Clicking a link inside an initialized checkbox `label` will now work correctly, and will not toggle the checkbox. [#2804](https://github.com/Semantic-Org/Semantic-UI/issues/2804)
- **Container** - Fix issue with `fluid container` being `100% + gutter` at mobile resolution (causing overflow)
- **Dropdown** - `forceSelection` no longer sets current value in search selection when current query is blank [#2058](https://github.com/Semantic-Org/Semantic-UI/issues/2058)
- **Dropdown** - Dropdown `@arrowSize` will now automatically reposition itself if size is changed with variable
- **Dropdown** - Dropdown arrow now has a variable `@dropdownArrowSize`, and is slightly smaller than previously
- **Dropdown** - Fix `left menu` inside `ui menu` appearing horizontally [#2778](https://github.com/Semantic-Org/Semantic-UI/issues/2778)
- **Dropdown** - Fixed error where menu would disappear when entering spaced words using `allowAdditions: true` caused by value matching its own whitespace-trimed value [#2853](https://github.com/Semantic-Org/Semantic-UI/issues/2853)
- **Dropdown** - Fixed issue where "no results" message would be still be visible before search query on input focus [#2824](https://github.com/Semantic-Org/Semantic-UI/issues/2824)
- **Dropdown** - Fixed issue where `onChange` would not fire when using `action: 'hide'`. [#2818](https://github.com/Semantic-Org/Semantic-UI/issues/2818)
- **Dropdown** - Fixed issue where selected item would not be shown when being re-shown after filtering with single search selection [#2824](https://github.com/Semantic-Org/Semantic-UI/issues/2824)
- **Dropdown** - Fixes issues with setting "" (empty quote) values when `placeholder: false` is used. Fixes issues with using `clear` and `restore defaults` without placeholders. [#2637](https://github.com/Semantic-Org/Semantic-UI/issues/2637)
- **Dropdown** - Remove use of `trim` which causes issues IE 11 and below [#2806](https://github.com/Semantic-Org/Semantic-UI/issues/2806)
- **Embed** - Remove accidental `console.log` statements in js [#2760](https://github.com/Semantic-Org/Semantic-UI/issues/2760)
- **Form / Input** - Fixes `::placeholder` text color for `ui error input`, modifies form error placeholder color to distinguish from form value error color [#2786](https://github.com/Semantic-Org/Semantic-UI/issues/2786)
- **Form / Input** - Fixes issue where `ui input` would sometimes collapse to `0px` width, especially when used inside an `inline field` [#2705 [#2621 [#2821](https://github.com/Semantic-Org/Semantic-UI/issues/2821)
- **Form** - `disabled field(s)` now remove `pointer-events` allowing it to disable checkbox and dropdown functionality  [#555](https://github.com/Semantic-Org/Semantic-UI/issues/#555)
- **Form** - Date input and other special input in chrome now are the same height as normal input (adds custom vendor shadow dom styling) [#2704](https://github.com/Semantic-Org/Semantic-UI/issues/2704)
- **Form** - Form will no longer show messages that are empty in `error`, `warning`, or `success` state.
- **Grid** - Fixed issue where `relaxed stackable grid` would have incorrect margin on mobile width
- **Grid** - Fixed issue where nested `stackable grid` would have incorrect margin on mobile.
- **Header** - Fixed `attached header` to have the correct bottom border on `top attached` and `attached` variations. [#2798](https://github.com/Semantic-Org/Semantic-UI/issues/2798)
- **Icon** - Fixed typo in cube icon alias caused by bad grep [#2765](https://github.com/Semantic-Org/Semantic-UI/issues/2765)
- **Input** - Fixed issue with appearance of `left corner labeled left icon input` [#2782](https://github.com/Semantic-Org/Semantic-UI/issues/2782)
- **Item** - Fixed `bottom aligned` not working in item due to incorrect flex value [#2826](https://github.com/Semantic-Org/Semantic-UI/issues/2826)
- **List** - Lists can now be `right floated` or `left floated`
- **Menu** - Fixed `(x) column` nested grid with alignment stacking vertically (wrong flex-direction) [#2810](https://github.com/Semantic-Org/Semantic-UI/issues/2810)
- **Menu** - Sub menus now work correctly and are correctly spaced inside `secondary menu` and text menu` [#2862](https://github.com/Semantic-Org/Semantic-UI/issues/2862)
- **Modal** - Fix autofocus setting in modal not working due to improper selector [#2737](https://github.com/Semantic-Org/Semantic-UI/issues/2737)
- **Modal** - Increased `close` specificity, modal will now only close on `> .close` [#2736](https://github.com/Semantic-Org/Semantic-UI/issues/2736)
- **Popup** - Fixes issue where variation would not be added to a pre-existing popup even if specified in javascript [#26011](https://github.com/Semantic-Org/Semantic-UI/issues/6011)
- **Search** - Calling `.search('show results')` no longer fails when input is not focused [#2842](https://github.com/Semantic-Org/Semantic-UI/issues/2842)
- **Table/Label** - `ribbon labels` will now automatically position themselves when used inside a table [#1930](https://github.com/Semantic-Org/Semantic-UI/issues/1930)
- **Transition** - Transition callbacks now all have the correct `this` set. [#2758](https://github.com/Semantic-Org/Semantic-UI/issues/2758)

**[Community Bug Fixes](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.1.0+is%3Aclosed)**
- **API** - API debug is now `false` by default, like other modules. [#2817](https://github.com/Semantic-Org/Semantic-UI/issues/2817)
- **Build Tools** - Removed octal literals from install scripts (for color escaping), and uses of future ECMAScript reserved words [#2838 [#2839 **Thanks @artemkaint**](https://github.com/Semantic-Org/Semantic-UI/issues/nt**)
- **Dropdown** - Fixed issue where label could not be removed when using a numeric value due to mismatched types [#2754 [#2755 **Thanks @dgurkaynak**](https://github.com/Semantic-Org/Semantic-UI/issues/ak**)
- **Menu** - Fixes tabular menu missing variable for background. **Thanks @frontdevde**
- **Step** - Fixed issue with display of step groups with only one step having incorrect border radius **Thanks @elliotisonfire** [#2869](https://github.com/Semantic-Org/Semantic-UI/issues/2869)
- **Sticky** - Sticky now sets width and height with `!important` to avoid inheritance issues in some cases **Thanks @lauri-elevant** [#2710](https://github.com/Semantic-Org/Semantic-UI/issues/2710)
- **Tab** - Fixed issue where simple path would be tested before full path, i.e. `first/` vs `/second/first/` causing tab to not open in some cases **Thanks @habibutsu** [#2843](https://github.com/Semantic-Org/Semantic-UI/issues/2843)

**Additional Bugs**
- **API** - API now will use automatically use `form` action if no api event is specified now  when form is `stateContext` but not initialized element
- **Build Tools** - Fixes issue on `win` platform where packaged theme would not correctly update when using watch due to regExp not matching windows path separators.
- **Dropdown** - Dropdown will no longer fire native `onchange` event on hidden input when setting value during initial load (unless `fireOnInit: true`) #2795 **Thanks @lauri-elevant**
- **Dropdown** - Fixed issue where `forceSelection` would not occur when `pageLostFocus` (clicked into another tab and back)
- **Dropdown** - Fixed issue where using the specific value `value="false"` would cause an option to not be removable from a multiple select
- **Dropdown** - When `useLabels: false` placeholder text will now show up when 0 items selected, instead of the text "0 items selected"
- **Dropdown/Tab** - Fixed an instance where `metadata` was not referencing settings metadata value
- **Form Validation** - Fixed issue with `get value(s)` where unchecked checkboxes would not correctly retrieve values
- **Form** - Dropdown in `inline field` now use auto width instead of 100%
- **Grid / Container** - `ui relaxed grid container` and `ui very relaxed grid container` will now all render at same container width
- **Grid** - Fixed `stackable celled grid` having doubled border width between rows
- **Header** - Fixed issue with em sizing of `chubby` and `bookish` header themes appearing too large
- **Icons** - Fixed issue where `active icon` or `emphasized icon` would not adjust opacity inside menus
- **Input** - `labeled input` now keeps border on label edge so that focus color appears correctly
- **Input** - Input now will reset `font-weight` and `font-style` if set on parent;
- **Input** `action input` and `labeled input` now have focused border on inner edge with label/button
- **Label** - `pointing` and `attached` labels are *now word order sensitive* to allow them to work correctly with other directional variations.
- **Label** - `pointint label` now rounds to exact pixel em value, should align correctly in more cases
- **Menu** - `@pressedItemColor` has been renamed to `@pressedItemTextColor` to match naming conventions of other variables
- **Menu** - Added `flex: 0 0 auto` to menu item to make sure menu do not collapse text content to reduce space
- **Menu** - Fix text align on `dropdown item` inside `icon menu`
- **Menu** - Fixed hybrid initialization not creating `menu` correctly. Fixed docs example of hybrid `<select>` initialization
- **Menu** - Fixed issue with `labeled input` text inside menu not appearing vertically centered
- **Popup** - Fixed `onRemove` firing even when popup is not removed
- **Reveal** - Reveal now uses `display: inherit` instead of forcing `inline-block`

### Version 2.0.8 - August 10, 2015

**All UI** - This release should fix issues caused when importing individual component using `require` when using [single component repos](https://github.com/Semantic-Org/). See discussion in [#2816](https://github.com/Semantic-Org/Semantic-UI/pull/2816), and previously [#1156](https://github.com/Semantic-Org/Semantic-UI/pull/1156), and [#1878](https://github.com/Semantic-Org/Semantic-UI/pull/1878)

### Version 2.0.7 - July 23, 2015

**Important Note**
This release should fix bugs some may have encountered with `npm install semantic-ui` hanging after set-up. See [this thread](https://github.com/Semantic-Org/Semantic-UI/issues/1816) for more details.

**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.7+is%3Aclosed)**
- **API** - Fixed some cases where `onComplete`, `onSuccess` and `onFailure` would receive XHR as first parameter and not `response`. [#2713](https://github.com/Semantic-Org/Semantic-UI/issues/2713)
- **API** - Fixed issue where `onFailure` would pass response as stringified JSON and not a JS object [#2713](https://github.com/Semantic-Org/Semantic-UI/issues/2713)
- **Build Tools** - Fixed some cases of `npm install` with CI or tests. Install will not stop to ask questions if project has an existing `semantic.json` file (more quiet options to come) [#1816](https://github.com/Semantic-Org/Semantic-UI/issues/1816)
- **Dropdown** - Fixed border radius on `circular labeled icon button`  [#2700](https://github.com/Semantic-Org/Semantic-UI/issues/2700)
- **Dropdown** - Fixed issue where dropdown nested inside `label` would not open. [#2711](https://github.com/Semantic-Org/Semantic-UI/issues/2711)
- **Popup** - Fixed issue where popup would not open on tablets with both touchscreen and mouse on mouseenter. [#2715](https://github.com/Semantic-Org/Semantic-UI/issues/2715)

**[Merged PR](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.7+is%3Aclosed)**
- **Build Tools** - Fixed autoprefixer not correctly setting `last 2 versions` [#2717](https://github.com/Semantic-Org/Semantic-UI/pull/2717) **Thanks @frontdevde**
- **Gulp Import** - Fixes error `Cannot find module 'gulp-help'` which may occur when importing gulp tasks [#2653](https://github.com/Semantic-Org/Semantic-UI/issues/2653) [#2668](https://github.com/Semantic-Org/Semantic-UI/pull/2668) **Thanks @fholzer**

**Docs**
- **Recipes** - Add links to Sketch files for SUI. Add example repo on how to import gulp tasks.


**Minor Enhancements**
- **API** - All API callbacks now receive `xhr` from API request as the third callback parameter

**Additional Fixes**
- **Checkbox** - Fix checkbox "check" appearing italicized when included inside italicized text
- **Popup** - Fixed terribly typo where popup `onShow` was mistakenly being called instead of `onHide` when hiding popup
- **Popup** - Popup on `touchstart` now occurs immediately without waiting for `delay.show`

### Version 2.0.6 - July 22, 2015

**Important Notes**
- **Form Validation** - In `2.0.4` `length` rules were corrected to match "exact length" and not "minimum length". This may have caused issues for those who were using this rule as min length previously. We've remedied any breaking changes introduced by by returning `length` to functioning as "minimum length" and added a new rule `exactLength` for matching exact length. #2681

**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.6+is%3Aclosed)**
- **Dropdown** - Fixed issue where `disabled` dropdown would still receive focus [#2699](https://github.com/Semantic-Org/Semantic-UI/issues/2699)
- **Dropdown** - Fixed `restore value` sometimes now working correctly due to "animating out" label still being mistaken for selected. [#2690](https://github.com/Semantic-Org/Semantic-UI/issues/2690)
- **Dropdown** - Added `set exactly` to remedy confusion of `set selected` not removing current selections with multiple [#2689](https://github.com/Semantic-Org/Semantic-UI/issues/2689)
- **List**- Fixed issue where using an image variation like `ui image label` as a direct child of an `item` would remove right padding [#2691](https://github.com/Semantic-Org/Semantic-UI/issues/2691)

**Additional Fixes**
- **Dropdown** - Fixed issue where using text labels, `useLabels: false`, would cause selection count to appear incorrect.
- **Dropdown** - Text labels, `useLabels: false`, now works correctly with `maxSelections`, and receives special UX considerations

### Version 2.0.5 - July 20, 2015
**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.5+is%3Aclosed)**

- **API** - Data replaced in urls, `urlData`, will now be url encoded by default. Additionally checks were added to avoid double encoding already encoded values. [#2394](https://github.com/Semantic-Org/Semantic-UI/issues/2394)
- **Checkbox** - Fix issue with `onChange` not firing when space key is used. Checkbox keyboard shortcuts now occur on `keydown` but cancel events correctly on `keyup` [#2676](https://github.com/Semantic-Org/Semantic-UI/issues/2676)
- **Radio Checkbox** - Fixed regression causing radio checkboxes to all appear selected in chrome due to `:indeterminate` selector [#2505](https://github.com/Semantic-Org/Semantic-UI/issues/2505)
- **Dropdown** - Fixed issue causing `multiple search dropdown` using [`search` inside menu](http://www.semantic-ui.com/modules/dropdown.html#search-in-menu) to break when multiple [#2666](https://github.com/Semantic-Org/Semantic-UI/issues/2666)
- **Message** - Fixed issues where icon would overlap in `icon message` when at mobile resolutions due to `flex-collapse` value being incorrect [#2665](https://github.com/Semantic-Org/Semantic-UI/issues/2665)

**Additional Fixes**
- **Dropdown** - `<select>` dropdowns initialized without `multiple` property set on `<select>` will now produce an error to alert users selection will not be preserved correctly. Related [#2573](https://github.com/Semantic-Org/Semantic-UI/issues/2573)
- **Dropdown** - Dropdown `<option>` added with `userAddition` now receive class name `addition` to distinguish from original `<select>` options. [#2573](https://github.com/Semantic-Org/Semantic-UI/issues/2573)
- **Dropdown** - User additions now have their `<option>` removed if a user deselects an addition. [#2573](https://github.com/Semantic-Org/Semantic-UI/issues/2573)

### Version 2.0.4 - July 17, 2015

**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.4+is%3Aclosed)**
- **Build Tools** - Fixed issue where sub tasks were undefined when importing SUI's `build` and `watch` tasks into custom gulpfile #2648
- **Button** - Fixed `fluid buttons` not working correctly with `<button>` due to button tags not supporting `flex` rules. [#2617](https://github.com/Semantic-Org/Semantic-UI/issues/2617)
- **Button** - Fixed colored vertical basic buttons appearing 2px offset [#2655](https://github.com/Semantic-Org/Semantic-UI/issues/2655)
- **Checkbox** - Checkbox now focuses after click, allowing for tab navigation from current position [#2610](https://github.com/Semantic-Org/Semantic-UI/issues/2610)
- **Checkbox** - Fixed checkbox not using javascript having incorrect colors on focus [#2607](https://github.com/Semantic-Org/Semantic-UI/issues/2607)
- **Dropdown** - Fixed `search selection` appearing incorrectly inside menu (default text would not disappear) [#2624](https://github.com/Semantic-Org/Semantic-UI/issues/2624)
- **Form** - Added `doesntContain` and `doesntContainExactly` [#2638](https://github.com/Semantic-Org/Semantic-UI/issues/2638)
- **Form** - Fixed issue with `minLength[1]` validation not behaving same as `minLength > 2` [#2636](https://github.com/Semantic-Org/Semantic-UI/issues/2636).
- **Form** - Fixes errors when a field identifier is named `identifier` [#2629](https://github.com/Semantic-Org/Semantic-UI/issues/2629)
- **Form** - Form fields will now error when a non-string identifier is used
- **Formatting** - Fixed several source files that had `CR LF` (Windows) line endings [#2649](https://github.com/Semantic-Org/Semantic-UI/issues/2649)
- **Input** - Fixed `left action input` displaying with incorrect `input` border radius inside `ui form` [#2638](https://github.com/Semantic-Org/Semantic-UI/issues/2638)
- **Modal** - Modal `action` now uses a more specific selector to prevent modifying `comment action`
- **Popup** - `fluid` popup with `setFluidWidth: true` (default value), will now use `parent` width and not `offsetContext` width [#2526](https://github.com/Semantic-Org/Semantic-UI/issues/2526)
- **Popup** - Fixed issues where rounding could cause elements that are against edge of page from not appearing. Add new `jitter` setting for allowing popups to escape page boundaries by a small margin [#2526](https://github.com/Semantic-Org/Semantic-UI/issues/2526)
- **Segment** - Added additional variables for `inverted` segment.
- **Segment* - `horizontal segments` in IE will no longer stretch to the natural width of child imgs [#2550](https://github.com/Semantic-Org/Semantic-UI/issues/2550) [flexbug [#1](h](https://github.com/Semantic-Org/Semantic-UI/issues/1](h)ttps://github.com/philipwalton/flexbugs[#1-mi](https://github.com/Semantic-Org/Semantic-UI/issues/1-mi)nimum-content-sizing-of-flex-items-not-honored)
- **Sidebar** - `right`, `top`, and `bottom` sidebar will not have their direction removed on `destroy` [#2644](https://github.com/Semantic-Org/Semantic-UI/issues/2644)
- **Sticky** - Fixed `sticky` element that cannot fit in viewport not scrolling correctly when fixed to viewport [#2605](https://github.com/Semantic-Org/Semantic-UI/issues/2605)
- **Transition** - Fixed issue where animating same element in its own `onComplete` would fail because animation had not yet called `force visible/hidden` [#2583](https://github.com/Semantic-Org/Semantic-UI/issues/2583)
- **Visibility** - `refreshOnResize` now correctly includes a default value [#2615](https://github.com/Semantic-Org/Semantic-UI/issues/2615)
- **Menu/Segment/Table** - Consolidated `attached` logic for all components using attached. [#2599](https://github.com/Semantic-Org/Semantic-UI/issues/2599)

**Additional Bugs**
- **Checkbox** - Fixed `space` shortcut causing checkbox to trigger twice
- **Checkbox** - Updated `colored` theme to add new focus color variables.
- **Popup** - `wide` and `very wide` popup will now limit themselves to normal popup widths on mobile so that they still appear on screen.
- **Message** - Fixes `attached icon message` not using `flex`
- **Sticky** - Fixed `sticky` content jumping from `fixed` to `bound bottom` when scroll position has surpassed bottom of container during page refresh.
- **Sticky** - Sticky no longer uses `bottomPadding` to determine bottom edge of container.
- **Steps** - Updated `basic` steps theme to appear correctly

**Docs**
- Fixed theme previews appearing incorrectly in all UI in docs. Regex parsing `.variable` files would ignore first variable after a comment.
- Added individual examples of all form validation rules
- Partial rewrite of sidebar documentation
- Updated example in theme guide to include checkbox focus colors

### Version 2.0.3 - July 8, 2015

**Docs Updates**
- **Examples** - Source code examples have been greatly improved. Required class names for each example will be highlighted in yellow. Other UI elements used in examples will now link out to their definition pages.


**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.3+is%3Aclosed)**
- **Checkbox** - Checkbox initialized with JS and with `for/id` matching would cause toggle to occur twice on click (making it seem as if nothing was updated) **thanks @malacalypse** [#2572](https://github.com/Semantic-Org/Semantic-UI/issues/2572)
- **Divider/Grid** - `vertical divider` no longer has inexplicable right border when stacked on mobile [#2558](https://github.com/Semantic-Org/Semantic-UI/issues/2558)
- **Dropdown** - Dropdown using `<select>` and `apiSettings` will now correctly add new `<option>` value when selections are made [#2573](https://github.com/Semantic-Org/Semantic-UI/issues/2573)
- **Icon** - `black icon` have been added back as a color option [#2556](https://github.com/Semantic-Org/Semantic-UI/issues/2556)
- **Icon** - Adds missing `square` and `square outline` icon [#2532](https://github.com/Semantic-Org/Semantic-UI/issues/2532)
- **Input** - Fixed errored input field having incorrect border radius with `labeled input`
- **Modal** - Modal that is larger than page height will now correctly reset body height on remove [#2576](https://github.com/Semantic-Org/Semantic-UI/issues/2576)
- **Popup** - Popup `preserve` setting (which preserves popup in DOM to avoid regenerating on each show/hide) was set to `true` by default causing generated popups to remain in DOM. [#1369](https://github.com/Semantic-Org/Semantic-UI/issues/1369)
- **Steps** - Fixed `github` theme for steps not displaying correctly in 2.0 [#2545](https://github.com/Semantic-Org/Semantic-UI/issues/2545)
- **Steps** - Last `step` no longer incorrectly shows arrow [#2552](https://github.com/Semantic-Org/Semantic-UI/issues/2552)
- **Transition** - Fixes `get current animation` erroring when `module cache` is cleared. [#2469](https://github.com/Semantic-Org/Semantic-UI/issues/2469)

**Additional Bugs**
- **Form** - URL regexp will now match now works correctly, and matches against non `http://` prefixed urls like `www.google.com`

### Version 2.0.2 - July 7, 2015

**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.2+is%3Aclosed)**

- **Dropdown** - Fixed regression in `2.0.1` causing search dropdown not to clear values correctly [#2533](https://github.com/Semantic-Org/Semantic-UI/issues/2533)
- **Site** - Sizing variables now are relative to `@emSize` adjusting all sizing variations proportionately as `@emSize` changes [#2538](https://github.com/Semantic-Org/Semantic-UI/issues/2538)
- **Dropdown** - Dropdown icon will now always toggle menu visibility [#2510](https://github.com/Semantic-Org/Semantic-UI/issues/2510)
- **Dropdown** -  Pressing same key on dropdown with multiple choices with same first letter will now cycle selections. For example "California" then "Colorado" when pressing C [#2516](https://github.com/Semantic-Org/Semantic-UI/issues/2516)
- **Dropdown** - Dropdown now changes text before calling `onChange` callback so that callback reflects new dropdown conditions [#2539](https://github.com/Semantic-Org/Semantic-UI/issues/2539)

**Additional Bugs**
- **Dropdown** - Clicking on label, or deleting a label will no longer trigger dropdown menu toggling
- **Dropdown** - Multiselect that do use text labels (e.g. "5 selected") will now remove filters on selection and scroll to last selected value

### Version 2.0.1 - July 6, 2015

**[Reported Bugs](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aissue+milestone%3A2.0.1+is%3Aclosed)**
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
- **Dropdown** - Dropdown no longer closes after max selections reached and enter key used for selection.
- **Dropdown** - Dropdown will now show correctly when menu only includes a message with no other items
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
- **Reveal** - Added new `active` state that allows you to show `reveal` programmatically
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
- **Statistic** - Statistic group now use `flex`. Styles have been updated.
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
- **Visibility** - Visibility includes a new setting `checkOnRefresh` which determines whether visibility callbacks should occur on resize or refresh
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
- **Card** - IE11 now can correctly use  `flexbox` cards **Thanks @Widcket**
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
- **Search** - Fixed `onSelect` returning the first term that matches the beginning of the selected value not the exact value.
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
- **Visibility** - Attach callbacks to elements visibility conditions like `top visible` `bottom visible`, `passing`. Useful for things like: image lazy loading, infinite scroll content, and recording tracking metrics.

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
- **Dropdown** - Fixes issue where dropdown would not open after restoring previous value on failed `search dropdown` search
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
- **Dropdown** - Dropdown ``onChange`` callback now fires when calling ``setSelected`` programmatically.

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
- **Dropdown** - Fixes issue where falsy value (i.e. 0) could not be selected
- **Transition** - Fixes transition exists function from not being called
- **Form** - Adds input type="url" to forms
- **Sidebar** - Fixes right sidebars to correctly allow for sizing (Thanks DveMac)
- **Sidebar** - Typo in sidebar header (Thanks slobo)


**Docs**
- Fixes various typos and missing closing html tags

### Version 0.9.3 - Nov 17, 2013

**Fixes**
- **Dropdown** - Fixes "falsy" values (like 0) not being processed correctly
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
- **Shape** - Transition duration can now be set programmatically
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
- Minor fixes to edge cases with setting and retrieving internals/settings as default, init, or during run-time on some modules

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
- Fixes popup position sometimes appearing off-stage on second appearance
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

- Fixes issues with modal not swapping to absolutely positioned from fixed when content cannot fit in viewport

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
