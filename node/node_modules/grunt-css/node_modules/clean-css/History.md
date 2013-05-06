0.9.1 / 2012-12-19
==================

 * Fixed issue #37 - converting 'white' and other colors in class names (reported by @malgorithms).

0.9.0 / 2012-12-15
==================

 * Added stripping quotation from font names (if possible).
 * Added stripping quotation from @keyframes declaration and animation/animation-name property.
 * Added stripping quotations from attributes' value (e.g. [data-target='x']).
 * Added better hex->name and name->hex color shortening.
 * Added shortening font:(normal|bold) the same way as font-weight is.
 * Refactored shorthand selectors and added (border-radius|border-style|border-color) shortening.
 * Added shortening (margin|padding|border-width).
 * Added removing line break after commas.
 * Fixed removing whitespace inside media query definition.
 * Added removing line breaks after a comma, so all declarations are one-liners now.
 * Speed optimizations (~10% despite many new features).
 * Added JSHint validation rules (via `make check`).

0.8.3 / 2012-11-29
==================

 * Fixed hsl/hsla colors processing.

0.8.2 / 2012-10-31
==================

 * Fixed shortening hex colors and their relation to hashes in urls.
 * Cleanup by @XhmikosR.

0.8.1 / 2012-10-28
==================

 * Added better zeros processing for rect(...) syntax (clip property).

0.8.0 / 2012-10-21
==================

 * Added removing urls quotation if possible.
 * Rewrote breaks processing.
 * Added (keepBreaks/-b) option to keep breaks in minimized file.
 * Reformatted lib/clean.js so it's easier to follow the rules.
 * Minimized test data is now minimized with line breaks so it's easier to compare the changes line by line.

0.7.0 / 2012-10-14
==================

 * Added stripping special comments to CLI (--s0 and --s1 options).
 * Added stripping special comments to programatic interface (keepSpecialComments option).

0.6.0 / 2012-08-05
==================

 * Full Windows support with tests (./test.bat).

0.5.0 / 2012-08-02
==================

 * Made path to vows local.
 * Explicit node 0.6 requirement.

0.4.2 / 2012-06-28
==================

 * Updated binary -v option (version).
 * Updated binary to output help when no options given (but not in piped mode).
 * Added binary tests.

0.4.1 / 2012-06-10
==================

 * Fixed stateless mode where calling CleanCSS#process directly was giving errors (reported by @facelessuser).

0.4.0 / 2012-06-04
==================

 * Speed improvements (up to 4x) thanks to rewrite of comments and CSS' content processing.
 * Stripping empty CSS tags is now optional (see ./bin/cleancss for details).
 * Improved debugging mode (see ./test/bench.js)
 * Added `make bench` for a one-pass benchmark.

0.3.3 / 2012-05-27
==================

  * Fixed tests, package.json for development, and regex for removing empty declarations (thanks to @vvo).

0.3.2 / 2012-01-17
==================

  * Fixed output method under node 0.6 which incorrectly tried to close process.stdout.

0.3.1 / 2011-12-16
==================

  * Fixed cleaning up '0 0 0 0' expressions.

0.3.0 / 2011-11-29
==================

  * Clean-css requires node 0.4.0+ to run.
  * Removed node's 0.2.x 'sys' package dependency (thanks to @jmalonzo for a patch).

0.2.6 / 2011-11-27
==================

  * Fixed expanding + signs in calc() when mixed up with adjacent (+) selector.

0.2.5 / 2011-11-27
==================

  * Fixed issue with cleaning up spaces inside calc/-moz-calc declarations (thanks to @cvan for reporting it).
  * Fixed converting #f00 to red in borders and gradients.

0.2.4 / 2011-05-25
==================

  * Fixed problem with expanding 'none' to '0' in partial/full background declarations.
  * Fixed including clean-css library from binary (global to local).

0.2.3 / 2011-04-18
==================

  * Fixed problem with optimizing IE filters.

0.2.2 / 2011-04-17
==================

  * Fixed problem with space before color in 'border' property.

0.2.1 / 2011-03-19
==================

  * Added stripping space before !important keyword.
  * Updated repository location and author information in package.json.

0.2.0 / 2011-03-02
==================

  * Added options parsing via optimist.
  * Changed code inclusion (thus version bump).

0.1.0 / 2011-02-27
==================

  * First version of clean-css library.
  * Implemented all basic CSS transformations.