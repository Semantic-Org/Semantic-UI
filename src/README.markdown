## Quick and Dirty Set-up

1) Rename the site configuration folder from ``/themes/_site`` to ``themes/site`` to avoid library updates modifying your site's settings.

2) Rename your semantic config file from ``semantic.config.example`` to ``semantic.config``

3) Use ``grunt build`` to output your project files, you can configure the paths used in ``grunt.config``. 

## Overview
* ``definitions/`` - contain all UI definitions
* ``themes/packaged/default`` are the default UI styling of an element
* ``themes/packaged`` are downloaded from the web or a package manager and provide preset overrides
* ``themes/user`` are the only files you should modify, these are your site's overrides for LESS and variables

## Building CSS

To make development easier, Semantic has a built in grunt config for building your project. Simply modify the **grunt.config** with the directories you need.

You can also build the source files with any processor for LESS. Just keep in mind to customize ``site.variables`` with your asset paths for images and fonts.

For information on installing grunt [see their guide](http://gruntjs.com/installing-grunt)

## Customizing Semantic

**There is only one folder you should ever edit files in ``themes/site``.** These are your site's LESS overrides and variable settings.

### Using a default theme
Leaving an element as  ``default`` will use baseline UI stylings.

The inheritance order when using default is:
1) ``themes/default/elements/button.variables`` loads the baseline UI variables
2) ``themes/packaged/default/elements/button.variables`` loads a blank file
3) ``themes/sites/elements.button.variables`` loads your variable overrides

### Using a packaged theme
Packaged themes can be downloaded from the internet, and placed inside ``themes/packaged/``

To use a packaged theme change the value inside ``semantic.config`` to the theme name.

For example if you change your button theme to 'chubby' the following load order would occur:

1) ``themes/default/elements/button.variables`` loads the UI variables
2) ``themes/packaged/chubby/elements/button.variables`` loads the "downloadable" theme (this will allow for community packages) In this example, a button theme called *chubby*
3) ``themes/sites/elements.button.variables`` loads **your overrides for variables**

## Adjust your site's configuration

To customize a ``ui button`` you can
* Add variable overrides in ``site/elements/button.variables``
* Add user LESS/CSS overrides in ``/site/elements/button.overrides`` (this will have all variables accessible)

Semantic now also includes some site-wide configuration by default in ``site.less`` it is recommended you include this also.

## Advanced grunt usage

``grunt reset`` - Clears your build directory. Use this if you have a source file that is no longer being tracked.

``grunt build`` - This will build all files (not just watched files) in your source directory

## Gotchas & Tips

Semantic **now requires a box-sizing reset** this allows us more flexibility inside the framework to not deal with issues related to calculating padding. This is included in ``site.less`` as well as a standard HTML reset.

