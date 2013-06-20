0.1.15 / 2013-05-13
-------------------

* Fixed #55, @trebor89


0.1.14 / 2013-05-12
-------------------

* Fixed #62, @maxtaco


0.1.13 / 2013-04-08
-------------------

* Added `.npmignore` to reduce package size


0.1.12 / 2013-02-10
-------------------

* Fixed conflictHandler (#46), @hpaulj


0.1.11 / 2013-02-07
-------------------

* Multiple bugfixes, @hpaulj
* Added 70+ tests (ported from python), @hpaulj
* Added conflictHandler, @applepicke
* Added fromfilePrefixChar, @hpaulj


0.1.10 / 2012-12-30
-------------------

* Added [mutual exclusion](http://docs.python.org/dev/library/argparse.html#mutual-exclusion)
  support, thanks to @hpaulj
* Fixed options check for `storeConst` & `appendConst` actions, thanks to @hpaulj


0.1.9 / 2012-12-27
------------------

* Fixed option dest interferens with other options (issue #23), thanks to @hpaulj
* Fixed default value behavior with `*` positionals, thanks to @hpaulj
* Improve `getDefault()` behavior, thanks to @hpaulj
* Imrove negative argument parsing, thanks to @hpaulj


0.1.8 / 2012-12-01
------------------

* Fixed parser parents (issue #19), thanks to @hpaulj
* Fixed negative argument parse (issue #20), thanks to @hpaulj


0.1.7 / 2012-10-14
------------------

* Fixed 'choices' argument parse (issue #16)
* Fixed stderr output (issue #15)


0.1.6 / 2012-09-09
------------------

* Fixed check for conflict of options (thanks to @tomxtobin)


0.1.5 / 2012-09-03
------------------

* Fix parser #setDefaults method (thanks to @tomxtobin)


0.1.4 / 2012-07-30
------------------

* Fixed pseudo-argument support (thanks to @CGamesPlay)
* Fixed addHelp default (should be true), if not set (thanks to @benblank)


0.1.3 / 2012-06-27
------------------

* Fixed formatter api name: Formatter -> HelpFormatter


0.1.2 / 2012-05-29
------------------

* Added basic tests
* Removed excess whitespace in help
* Fixed error reporting, when parcer with subcommands
  called with empty arguments


0.1.1 / 2012-05-23
------------------

* Fixed line wrapping in help formatter
* Added better error reporting on invalid arguments


0.1.0 / 2012-05-16
------------------

* First release.
