2.0.5 / 2013-04-26
------------------

* Close security issue in !!js/function constructor.
  Big thanks to @nealpoole for security audit.


2.0.4 / 2013-04-08
------------------

* Updated .npmignore to reduce package size


2.0.3 / 2013-02-26
------------------

* Fixed dumping of empty arrays ans objects. ([] and {} instead of null)


2.0.2 / 2013-02-15
------------------

* Fixed input validation: tabs are printable characters.


2.0.1 / 2013-02-09
------------------

* Fixed error, when options not passed to function cass


2.0.0 / 2013-02-09
------------------

* Full rewrite. New architecture. Fast one-stage parsing.
* Changed custom types API.
* Added YAML dumper.


1.0.3 / 2012-11-05
------------------

* Fixed utf-8 files loading.


1.0.2 / 2012-08-02
------------------

* Pull out hand-written shims. Use ES5-Shims for old browsers support. See #44.
* Fix timstamps incorectly parsed in local time when no time part specified.


1.0.1 / 2012-07-07
------------------

* Fixes `TypeError: 'undefined' is not an object` under Safari. Thanks Phuong.
* Fix timestamps incorrectly parsed in local time. Thanks @caolan. Closes #46.


1.0.0 / 2012-07-01
------------------

* `y`, `yes`, `n`, `no`, `on`, `off` are not converted to Booleans anymore.
  Fixes #42.
* `require(filename)` now returns a single document and throws an Error if
  file contains more than one document.
* CLI was merged back from js-yaml.bin


0.3.7 / 2012-02-28
------------------

* Fix export of `addConstructor()`. Closes #39.


0.3.6 / 2012-02-22
------------------

* Removed AMD parts - too buggy to use. Need help to rewrite from scratch
* Removed YUI compressor warning (renamed `double` variable). Closes #40.


0.3.5 / 2012-01-10
------------------

* Workagound for .npmignore fuckup under windows. Thanks to airportyh.


0.3.4 / 2011-12-24
------------------

* Fixes str[] for oldIEs support.
* Adds better has change support for browserified demo.
* improves compact output of Error. Closes #33.


0.3.3 / 2011-12-20
------------------

* jsyaml executable moved to separate module.
* adds `compact` stringification of Errors.


0.3.2 / 2011-12-16
------------------

* Fixes ug with block style scalars. Closes #26.
* All sources are passing JSLint now.
* Fixes bug in Safari. Closes #28.
* Fixes bug in Opers. Closes #29.
* Improves browser support. Closes #20.
* Added jsyaml executable.
* Added !!js/function support. Closes #12.


0.3.1 / 2011-11-18
------------------

* Added AMD support for browserified version.
* Wrapped browserified js-yaml into closure.
* Fixed the resolvement of non-specific tags. Closes #17.
* Added permalinks for online demo YAML snippets. Now we have YPaste service, lol.
* Added !!js/regexp and !!js/undefined types. Partially solves #12.
* Fixed !!set mapping.
* Fixed month parse in dates. Closes #19.


0.3.0 / 2011-11-09
------------------

* Removed JS.Class dependency. Closes #3.
* Added browserified version. Closes #13.
* Added live demo of browserified version.
* Ported some of the PyYAML tests. See #14.
* Fixed timestamp bug when fraction was given.


0.2.2 / 2011-11-06
------------------

* Fixed crash on docs without ---. Closes #8.
* Fixed miltiline string parse
* Fixed tests/comments for using array as key


0.2.1 / 2011-11-02
------------------

* Fixed short file read (<4k). Closes #9.


0.2.0 / 2011-11-02
------------------

* First public release
