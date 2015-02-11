## Using Build Tools

To build Semantic UI from its source less files you can use the built in gulp tasks.

From the Semantic directory you can use gulp by running.
```bash
npm install
```

After install finishes you can start build tools using
```bash
gulp watch
```
or
```bash
gulp build
```

## Using Custom Pipelines

#### Gulp Import

Each gulp task can be imported into your own Gulpfile

```javascript
var
  watch = require('path/to/semantic/tasks/watch')
;
gulp.task('watch ui', 'Watch Semantic UI', watch));
```

#### LESS Import

Before using source files you will need to create a `theme.config` by renaming `theme.config.example`

This file is used to configure which packaged theme each component should use.

After adjusting the file, you can import files into less two ways:

To import all of Semantic UI:
```less
@import 'src/semantic.less';
```

To import a specific component
```less
@import 'src/definitions/elements/button';
```

#### Overview

* `definitions/` contains the `css` and `javascript` definitions for each component
* `themes/` contains *pre-packaged themes* including Semantic's default theme
* `site/` contains your current project's theme, known formally as a "site theme"

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