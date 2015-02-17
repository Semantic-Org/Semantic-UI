## Setup

### Built-In Tools

From the Semantic directory you can setup gulp to build Semantic by running.
```bash
npm install
```

Semantic will automatically configure itself using a `post-install` script built into the package.

After set-up can use gulp to build your project's css:
```bash
/* Watch files */
gulp watch

/* Build all files */
gulp build
```

Visit the [Getting Started Guide](http://learnsemantic.com/guide/expert.html) for more details on set-up

### Custom Pipelines

#### Importing Gulp Tasks

Each gulp task can be imported into your own Gulpfile using `require`

```javascript
var
  watch = require('path/to/semantic/tasks/watch')
;
gulp.task('watch ui', 'Watch Semantic UI', watch));
```

#### Importing LESS

> LESS files do not contain vendor prefixes. If you are to use these files directly you must add them during your build step.

Before using source files you will need to create a `theme.config` by renaming `theme.config.example`

This file is used to configure which packaged theme each component should use.

You can then import Semantic from your own LESS files:
```less
/* Import all components */
@import 'src/semantic';

/* Import a specific component */
@import 'src/definitions/elements/button';
```


## Theming

### Concepts

#### Inheritance

There are three levels of inheritance in Semantic
* Default theme - Semantic UI's neutral default theme
* Packaged theme - A specified packaged theme, like "amazon", or "material"
* Site theme - A theme specific to your site

#### Folder Structure

* `definitions/` contains the `css` and `javascript` definitions for each component
* `themes/` contains *pre-packaged themes* including Semantic's default theme
* `site/` contains your current site's theme

View the [Theming Guide](http://learnsemantic.com/themes/overview.html) for a more in-depth look

## Customizing

#### Basic Customization

The best way to start customizing is to specify overriding variables in your site's `site.variables` file.

This is a blank stub file that lets you specify variables that overriding variables.

Some important values to customize:
* Base font size
* Named color hex codes
* Header/Page Font-families
* Primary and secondary colors
* Grid column count

To find out what variables are available to modify, you can inspect the variables in the default theme in `themes/default/`

#### Advanced Configuration

Each component has its own variable file, which can be used to modify any of the underlying variables for that component.

For example `/site/elements/button.variables`.

You may also specify your own custom LESS in `site/elements/button.overrides`. This file will have access to all underlying variables available for that component.

#### Using Pre-Packaged Themes

You can modify `theme.config` to use any prepackaged theme available in `src/themes/`.

For example you can modify `theme.config` to use a `github` button theme by changing
```less
@button: 'github';
```

View the [Customization Guide](http://learnsemantic.com/developing/customizing.html) to learn more

