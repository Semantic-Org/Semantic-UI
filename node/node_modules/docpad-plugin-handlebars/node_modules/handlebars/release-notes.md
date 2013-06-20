# Release Notes

## Development
[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.12...master)

## v1.0.12 / 1.0.0 - May 31 2013

- [#515](https://github.com/wycats/handlebars.js/issues/515) - Add node require extensions support ([@jjclark1982](https://github.com/jjclark1982))
- [#517](https://github.com/wycats/handlebars.js/issues/517) - Fix amd precompiler output with directories ([@blessenm](https://github.com/blessenm))
- [#433](https://github.com/wycats/handlebars.js/issues/433) - Add support for unicode ids
- [#469](https://github.com/wycats/handlebars.js/issues/469) - Add support for `?` in ids
- [#534](https://github.com/wycats/handlebars.js/issues/534) - Protect from object prototype modifications
- [#519](https://github.com/wycats/handlebars.js/issues/519) - Fix partials with . name ([@jamesgorrie](https://github.com/jamesgorrie))
- [#519](https://github.com/wycats/handlebars.js/issues/519) - Allow ID or strings in partial names
- [#437](https://github.com/wycats/handlebars.js/issues/437) - Require matching brace counts in escaped expressions
- Merge passed partials and helpers with global namespace values
- Add support for complex ids in @data references
- Docs updates

Compatibility notes:
- The parser is now stricter on `{{{`, requiring that the end token be `}}}`. Templates that do not
  follow this convention should add the additional brace value.
- Code that relies on global the namespace being muted when custom helpers or partials are passed will need to explicitly pass an `undefined` value for any helpers that should not be available.

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.11...v1.0.12)

## v1.0.11 / 1.0.0-rc4 - May 13 2013

- [#458](https://github.com/wycats/handlebars.js/issues/458) - Fix `./foo` syntax ([@jpfiset](https://github.com/jpfiset))
- [#460](https://github.com/wycats/handlebars.js/issues/460) - Allow `:` in unescaped identifers ([@jpfiset](https://github.com/jpfiset))
- [#471](https://github.com/wycats/handlebars.js/issues/471) - Create release notes (These!)
- [#456](https://github.com/wycats/handlebars.js/issues/456) - Allow escaping of `\\`
- [#211](https://github.com/wycats/handlebars.js/issues/211) - Fix exception in `escapeExpression`
- [#375](https://github.com/wycats/handlebars.js/issues/375) - Escape unicode newlines
- [#461](https://github.com/wycats/handlebars.js/issues/461) - Do not fail when compiling `""`
- [#302](https://github.com/wycats/handlebars.js/issues/302) - Fix sanity check in knownHelpersOnly mode
- [#369](https://github.com/wycats/handlebars.js/issues/369) - Allow registration of multiple helpers and partial by passing definition object
- Add bower package declaration ([@DevinClark](https://github.com/DevinClark))
- Add NuSpec package declaration ([@MikeMayer](https://github.com/MikeMayer))
- Handle empty context in `with` ([@thejohnfreeman](https://github.com/thejohnfreeman))
- Support custom template extensions in CLI ([@matteoagosti](https://github.com/matteoagosti))
- Fix Rhino support ([@broady](https://github.com/broady))
- Include contexts in string mode ([@leshill](https://github.com/leshill))
- Return precompiled scripts when compiling to AMD ([@JamesMaroney](https://github.com/JamesMaroney))
- Docs updates ([@iangreenleaf](https://github.com/iangreenleaf), [@gilesbowkett](https://github.com/gilesbowkett), [@utkarsh2012](https://github.com/utkarsh2012))
- Fix `toString` handling under IE and browserify ([@tommydudebreaux](https://github.com/tommydudebreaux))
- Add program metadata

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.10...v1.0.11)

## v1.0.10 - Node - Feb 27 2013

- [#428](https://github.com/wycats/handlebars.js/issues/428) - Fix incorrect rendering of nested programs
- Fix exception message ([@tricknotes](https://github.com/tricknotes))
- Added negative number literal support
- Concert library to single IIFE
- Add handlebars-source gemspec ([@machty](https://github.com/machty))

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.9...v1.0.10)

## v1.0.9 - Node - Feb 15 2013

- Added `Handlebars.create` API in node module for sandboxed instances ([@tommydudebreaux](https://github.com/tommydudebreaux))

[Commits](https://github.com/wycats/handlebars.js/compare/1.0.0-rc.3...v1.0.9)

## 1.0.0-rc3 - Browser - Feb 14 2013

- Prevent use of `this` or `..` in illogical place ([@leshill](https://github.com/leshill))
- Allow AST passing for `parse`/`compile`/`precompile` ([@machty](https://github.com/machty))
- Optimize generated output by inlining statements where possible
- Check compiler version when evaluating templates
- Package browser dist in npm package

[Commits](https://github.com/wycats/handlebars.js/compare/v1.0.8...1.0.0-rc.3)

## Prior Versions

When upgrading from the Handlebars 0.9 series, be aware that the
signature for passing custom helpers or partials to templates has
changed.

Instead of:

```js
template(context, helpers, partials, [data])
```

Use:

```js
template(context, {helpers: helpers, partials: partials, data: data})
```
