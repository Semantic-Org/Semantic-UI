## Built-In Tools

From the Semantic directory you can setup gulp to build Semantic by running.
```bash
npm install
```

After install finishes you can use gulp commands:
```bash
/* Watch files */
gulp watch

/* Build all files */
gulp build
```

[Getting Started Guide](http://learnsemantic.com/guide/expert.html)

## Custom Pipelines

#### Importing Gulp Tasks

Each gulp task can be imported into your own Gulpfile using `require`

```javascript
var
  watch = require('path/to/semantic/tasks/watch')
;
gulp.task('watch ui', 'Watch Semantic UI', watch));
```

#### Importing LESS

Before using source files you will need to create a `theme.config` by renaming `theme.config.example`

This file is used to configure which packaged theme each component should use.

After renaming the file, you can import less files in two ways:

To import all of Semantic UI:
```less
/* Import all components */
@import 'src/semantic';

/* Import a specific component */
@import 'src/definitions/elements/button';
```

## Theming

#### Overview

* `definitions/` contains the `css` and `javascript` definitions for each component
* `themes/` contains *pre-packaged themes* including Semantic's default theme
* `site/` contains your current site's theme

#### Inheritance

There are three levels of inheritance in Semantic
* Default theme - Semantic UI's neutral default theme
* Packaged theme - A specified packaged theme, like "amazon", or "material"
* Site theme - A theme specific to your implementation

#### Site.variables

Each level of inheritance (default theme, packaged theme, and site theme) include **its own** `site.variables` file. This includes the most important values to modify for customizing your site.

#### Using Pre-Packaged Themes

You can modify `theme.config` to use any prepackaged theme available in `src/themes/`.

For example you can modify `theme.config` to use a `github` button theme by changing
```less
@button: 'github';
```

Each theme has its own `site.variables`


### Using Site Themes

The most important place to modify your site's


#### CSS Overrides

`site/` folder contains stub `.variable` and `.override` files for each component. Variable files can be used to modify variables values for your site.