## Getting Semantic UI

For links to download Semantic UI, check our our [download page](http://www.learnsemantic.com/guide/download.html).

## Setting Up

### Dependencies
Semantic uses command-line tools to build your project while theming. After getting Semantic, you will need to install [nodejs](http://nodejs.org/download/) and [gulp](https://github.com/gulpjs/gulp/) to run the build process.

Once you're up and running. Navigate to the semantic directory and install the npm dependencies
```bash
  # install dependencies
  npm install
  # start install script
  gulp
```

### Installing Semantic

The first time you run gulp you will be greeted with an interactive installer
```bash
  # install
  gulp
```

The installer will let you select which components to include, and specify paths for your project.

| Installation Type | Description |
| ------------- | ------------- |
| Automatic  | Installation will use the default paths, outputing css files to  `dist/` and packaging all components together  |
| Express  | Will let you move your site folder and your dist folder and select from a list of components to include in your concatenated release.  |
| Custom  | Will prompt you for all available options  |

The install process will create two files:  `semantic.json` stores paths for your build  and sits on the top-level of your project,  `theme.config` is a **LESS** file that exists in **src/** and allows you to centrally set the themes for each UI component.

The installer will also create a special folder which contains your site-specific themes. The default location for this is  `src/site`. For more information on using site themes, see the theming guide below.

### Manual Install
If you prefer these files and folders can be moved manually instead of using the installer.
```bash
  mv semantic.json.example semantic.json
  mv src/theme.config.example src/theme.config
  mv src/_site src/site
  vi semantic.json
```

### Upgrading Semantic

You can use normal package manager functions to update your project, just be sure to re-install semantic after upgrading. Re-install will **extend your  `semantic.json` but not overwrite it**
```bash
  bower update
  cd ./bower_modules/semantic-ui
  gulp install
```

> For a full list of settings for **semantic.json**, check the <a href="https://github.com/Semantic-Org/Semantic-UI/blob/1.0/tasks/defaults.js">defaults values</a> which it inherits from.

## Using Semantic Build Tools

### Gulp commands
After setting up your project you have access to several commands for building your css and javascript.

```bash
  gulp # runs default task (watch)
  gulp watch # watches files for changes
  gulp build # builds all files from source
  gulp install # re-runs install
```


Semantic creates minified, and uncompressed files in your source for both individual components, and the components specified for your packaged version.


Keep in mind semantic will automatically adjust URLs in CSS and add vendor-prefixes as part of the build process. This means **definitions and theme files do not need vendor prefixes**.

#### Advanced Usage

> In addition to the paths set in  `semantic.json`, you can serve files to a second location, for example, a docs instance by using a separate config file  `tasks/admin/docs.json`. Using a copy of the SUI documentation may work well internally for creating a style guide to hack on the theme designs for your project.

```bash
  gulp serve-docs
  gulp build-docs
```

### Workflow

Building and watching Semantic is only necessary while adjusting your UI. This is usually the first part of building a new project, and a separate process than building-out pages in your site.

During this architecting phase you can try <a href="http://www.learnsemantic.com/themes/creating.html">downloading different themes</a>, adjusting your <a href="http://www.learnsemantic.com/developing/customizing.html#setting-global-variables">site-wide settings</a> (font-family, colors, etc) and tweaking components in your site's <a href="http://www.learnsemantic.com/developing/customizing.html#designing-for-the-long-now">component overrides</a>.


Files in the  `examples/` folder of your project can be useful for testing out changes in your UI. For example, you might run  `gulp watch` download a new theme to  `src/site/themes/` then adjust your  `theme.config` file with the name of the new theme and refresh  `examples/kitchensink.html` to inspect changes in the theme.
You will only need to use Semantic's build tools while refining your UI, while designing pages you can rely on the packages in  `dist/` and your software stack's normal build set-up.

 `gulp watch` will automatically recompile only the necessary definition files when you update  `semantic.config` or any  `.variables` or  `.overrides` file.

