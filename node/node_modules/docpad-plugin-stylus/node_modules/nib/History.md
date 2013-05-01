
0.9.1 / 2013-01-04 
==================

  * Quote -ms-filter selector value
  * Vendor font-smoothing property
  * fix call stack explosion when using `flex-wrap: wrap`

0.9.0 / 2012-11-24 
==================

  * flex box update

0.8.2 / 2012-08-28 
==================

  * fix `!important` preservation for all mixins [kizu]

0.8.1 / 2012-08-21 
==================

  * add 'replace-text' mixin to nib/text index.styl
  * revert "Remove obsolete FlexBox vendor-prefixes" [caseywebdev]

0.8.0 / 2012-08-17 
==================

  * add prefixing of `transform` [kizu]
  * add text-overflow vendor
  * add overflow-scrolling vendor

0.7.0 / 2012-07-09 
==================

  * add `image(path, [w], [h])` mixing

0.6.0 / 2012-07-05 
==================

  * add support for `linear-gradient(stops...)`. Closes #110
  * replace hide-text() w/ text-indent: 100% method

0.5.0 / 2012-05-28 
==================

  * Added perspective-origin property
  * Added tab-size property
  * Updated stylus dependency, fixes #89
  * Update opacity to clear issue with IE rendering value of 100 (to override previous semi-opaque state) and support IE5-8 in all the different varieties of life (http://www.quirksmode.org/css/opacity.html)
  * Deprecated a couple EOL moz prefixes, removed -o-background-size
  * Remove duplicate imports and defines (fixes #81)
  * Refactored background-clip, added background-origin.
  * Preserving importance for opacity

0.4.1 / 2012-04-15 
==================

  * There is a moz-box-flex-group actually [kizu]
  * There were no importance for overflow [kizu]
  * Appearance is only webkit/moz now [kizu]
  * Still no hyphens in Opera [kizu]
  * There would be animations in IE10 and probably (there were an experimental build of it) in Opera 12) [kizu]
  * Updated fexbox prefixes (flex-group is only in webkit, no ordinal-group in Opera) [kizu]
  * 3D transforms now in IE10 and in Fx, but still not in Opera [kizu]
  * There would be transitions in IE10 [kizu]
  * Fixed the background-clip prefixes: it have different syntax for old webkit and moz, also it have only webkit for text [kizu]
  * Added column-span and column-fill [kizu]
  * Correct prefixes for column-clip, moved it in place with other column- props [kizu]
  * There would be -ms-user-select in IE10 [kizu]
 
0.4.0 / 2012-04-03 
==================

  * Added `box-ordinal-group` support [panosru]
  * Added `transform-origin` support [panosru]
  * Added `perspective` support
  * Added `transform-style` support
  * Added `display: box` vendor support
  * Removed buttons
  * Changed: use mocha for test runner

0.3.2 / 2012-01-09 
==================

  * Remove `<font>` from the `global-reset()` helper [TooTallNate]

0.3.1 / 2011-11-30 
==================

  * Added vendor `appearance` property
  * Updated `replace()`
  * Fixed tests

0.3.0 / 2011-11-17 
==================

  * Added support for o and ms prefixes to text-overflow helper [Ian Storm]
  * Added "overflow: ellipsis" support [Ian Storm]

0.2.0 / 2011-08-26 
==================

  * Added `color-image` stylus function [guillermo]

0.1.0 / 2011-08-04 
==================

  * Added `box` style mixin [podviaznikov]
  * Added `box-flex-group` to vendor.styl [podviaznikov]
  * Added `box-direction` support [podviaznikov]
  * Added `backface-visibility` [podviaznikov]
  * Added `columns` support [podviaznikov]
  * Added animations into vendor [podviaznikov]
  * Lowered text-indent to a moderate -99999em, since my browser (Chromium 13.0.767.1 on Linux amd64) won't hide text if text-indent is below -6990506em.

0.0.8 / 2011-05-24 
==================

  * Added _config.styl_
  * Added linear gradients for Opera, IE10 and WebKit (non-legacy)
  * Moved `no-wrap` back to _vendor.styl_

0.0.7 / 2011-04-24 
==================

  * Added moz to `transition()`. Closes #4
  * Refactored reset

0.0.6 / 2011-04-15 
==================

  * Added `has-canvas` global
  * Added `clearfix()` [Isaac Johnston]
  * Added `relative()`
  * Fixed; ignore size unit for `linear-gradient()` when node-canvas is not available

0.0.5 / 2011-04-12 
==================

  * `.include(nib.path)` within the plugin

0.0.4 / 2011-04-12 
==================

  * Removed display inline

0.0.3 / 2011-04-11 
==================

  * Fixed no-wrap backwards assignment

0.0.2 / 2011-04-11 
==================

  * Fixed `no-wrap`, now a literal of `nowrap`

0.0.1 / 2011-04-11 
==================

  * Initial release
