v0.1.4 - June 7, 2013
--------------------

Thanks to @balupton, @tsantef, @ForbesLindesay

- [Fixed CoffeeScript version problems](https://github.com/rstacruz/js2coffee/issues/189)
  - [Use only compatible coffee-script version](https://github.com/rstacruz/js2coffee/pull/196)
  - [Defines RESERVED words if not defined](https://github.com/rstacruz/js2coffee/pull/194)
  - Rewrote to only use local coffee-script installation, rather than using global installation
- [Fixed global leak](https://github.com/rstacruz/js2coffee/pull/174)
- Tests now use the [Joe Test Runner](https://github.com/bevry/joe), instead of using nothing before
- Watched, compiled, bundled, and automatically tested with [DocPad](http://docpad.org/)
- Added [TravisCI](https://travis-ci.org/) support


v0.1.3 - January 6, 2012
--------------------

Small "emergency" bugfixes, thanks @tricknotes.

### Fixed:
 * Exit when compilation completes in Node 0.6. (#112)
 * Fix typo in the help text when typing `js2coffee`. (#113)


v0.1.2 - October 15, 2011
---------------------

Thanks to @Wisdom, @nilbus, @joelvh, @gabipurcaru, @michaelficarra, @tricknotes,
@eventualbuddha, @clkao for the contributions.

### Fixed:
  * Fix misspelling in package.json.
  * Object lookups using object literals (`o[{a:1, b:2}]`) are now supported.
  * Fixed `js2coffee file.js` not working in Linux. (#90, #54)
  * Returning from an if without curly braces are now supported. (`if (x) return 
      y;`)) (#50)
  * Returning object literals should now have the objects parenthesized
    properly.  ( `return {x:1, y:2}`) (#52)
  * Always new-line objects to support `{ a: { b: c } }`. (#96, #94)
  * Reserved words are now allowed as property accessors. Fixes
    `object.on(...)`. (#97, #95, #75)
  * Empty switch cases now get compiled correctly. (#70, #28)
  * The value `undefined` now gets compiled properly. (#20, #85)
  * Declaring `var x` will now translate to `x = undefined`. (#79)
  * Updated reserved keywords list. (#25, #67)

### Changed:
  * Compile `!!` into `!!` instead of `not not`. (#30)
  * Implement CRLF support. Closes (#81, #88)
  * `!!!x` now condenses to `not x`.
  * `==` and `===` now become `is`. (#29)
  * `!(a instanceof b)` now becomes `a not instanceof b`. (#29)
  * Doing `var x = y` will now have different behavior for reserved keywords.
    (#79)

### Misc changes:
  * Fixed bad link in README. (#63)
  * Make `npm test` run tests.
  * Running tests now shows less output.
  * Running tests now exits with an error code when it fails.


v0.1.1 - July 09, 2011
---------------------

### Fixed:
  * Invert the 'a == null' behavior. (#19, #51)
  * Fix the problem where passing an anonymous function as a parameter can
    sometimes lead to syntax errors. (#55)


v0.1.0 - June 13, 2011
---------------------

Lots of refactoring and new improvements.

### Added:
  * Single line ifs. `if (x) continue;` will now compile to `continue if x`.
  * Hide empty catches. (#32).
    * `try { .. } catch (f) {}` now becomes `try ..` without a catch.
  * Omit returns more agressively. (#42)
  * Omit many unneeded parentheses in certain cases. (#31)

### Fixed:
  * Fix `x.prototype.y` to be `x::y` instead of `x::.y` (#24)
  * The `in` operator now compiles to `of`. (#46)
    * `a in b` now compiles to `a of b`.
  * Fix floating point numbers. (#45)
  * Fix a problem with returning object literals. (#47)

### Refactoring:
  * Lots and lots of refactoring.
  * `Builder` is now a class (to support warnings in the future, and more).
  * Implement a new `Transformer` class to do AST transformations before building the compiled source.
  * Recursive functions now use `Node::walk()`.
  * Move stuff into `js2coffee/helpers.coffee` and `js2coffee/node_ext.coffee`.


v0.0.5 - June 10, 2011
---------------------

Special thanks to [Michael Ficarra](http://github.com/michaelficarra) for agressively
reporting issues and suggesting numerous improvements.

### Added:
  * Account for negative existence checks (`if !x?`). (#19)
    * Compile `if (x != null)` to `unless x?`
    * Compile `if (x === null)` to `if x?`
  * Ensure object literals with more than one property get surrounded by `({ .. })`. (#8)
  * Support `debugger`. (#27)
  * Support destructuring in functions. (#17)
  * Use `loop` instead of `while true` in while and for loops. (#35)
  * Use the `::` prototype operator. (#24)
  * Use `unless` and `until` as the inverse of `if` and `while` respectively. (#35)

### Fixed:
  * Keys in object literals now get quoted if needed. This fixes the erroneous
    compilation of objects such as `{ 'click #button': function() { ... } }`.


v0.0.4 - June 09, 2011
---------------------

### Changed:
  * Allow single-line JS comments without a newline in the end.
  * Enquote identifiers in object literals as needed. (#16)
  * Ensure that percent interpolation (%i) don't get messed up in the Node version. (#13)
  * Ensure that when anonymous functions are called, they are parenthesized. (#14)

### Added:
  * more tests.

### Fixed:
  * `++b` is now no longer erroneously translated to `b++`.
  * Fixed an issue where `{ off: 2 }` erroneously becomes `{ off_: 2 }`.
  * Returning object literals should now not create invalid CoffeeScript. (#15)

### Misc:
  * Annotate the source code.
  * Make a simpler (but less stringent) JS packing routine for `js2coffee.min.js`.


v0.0.3 - June 05, 2011
---------------------

### Fixed:
  * Narcissus to not go into an infinite loop in the browser.
  * Use `this` instead of `@` for better readability. (#10)

### Changed:
  * Implement += and friends. (#9)
  * Use 'cake' instead of 'make'.


v0.0.2 - June 4, 2011
---------------------

### Changed:
  * Better string escaping
  * Better handling of empty blocks
  * Support for commas (eg: `a = 2, b = 3`)
  * Returns and breaks are omitted when not needed
  * Switch/case now uses `switch` instead of `if`
  * Some other improvements


v0.0.1
------

Initial version.
