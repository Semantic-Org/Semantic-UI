[Grunt homepage](https://github.com/gruntjs/grunt) | [Documentation table of contents](toc.md)

# Grunt exit codes

* `1` - Generic error
* `2` - Config file not found
* `3` - Task failure
* `10` - [UglifyJS](https://github.com/mishoo/UglifyJS) error
* `11` - Banner generation error
* `20` - Init error
* `90-99` - [Nodeunit](https://github.com/caolan/nodeunit) / [QUnit](http://docs.jquery.com/QUnit) error

## Nodeunit / QUnit specific

* `90` - Non assertion-specific error, like a timeout or JavaScript error.
* `91-99` - 91 = 1 assertion failed, 95 = 5 assertions failed, 99 = 9 or more assertions failed (you get the idea).
