![Semantic](http://www.semantic-ui.com/images/logo.png)

# Semantic UI

Semantic is a highly-themable UI framework with intuitive naming conventions built around common usage.

Key Features
* 50+ UI Elements
* 3000 + CSS Variables
* 3 Levels of Variable Inheritance (Similar to SublimeText)
* Built using EM values for responsive design

> Semantic UI is now at 1.0, be sure to check out our [release notes](https://github.com/Semantic-Org/Semantic-UI/blob/master/RELEASE-NOTES.md#version-100---november-24-2014) for changes from the pre-release.

## Release Schedule

Semantic follows a weekly schedule for feature updates. To see what changes are scheduled for upcoming releases, be sure to visit the [release milestone](https://github.com/Semantic-Org/Semantic-UI/milestones) page.

## Community Support

* **Want to learn about Semantic?** [Request an Invite](https://docs.google.com/forms/d/1hI1z136sXLkTQKtsv8SIvjjAvzpH77YzMQKrU-P8GAc/viewform?usp=send_form) to join [our Slack chatroom](http://semanticui.slack.com) for support and project discussions
* **Have a bug?** Make a test case by forking this [jsfiddle](http://jsfiddle.net/efp8z6Ln/), then submit a [bug on GitHub](https://github.com/Semantic-Org/Semantic-UI/issues)
* **Having issues with your code?** Submit a question on [StackOverflow](http://www.stackoverflow.com) or ask our [Google Group](https://groups.google.com/forum/#!forum/semantic-ui)
* **Looking for a specific integration like Dart, Wordpress, Angular, or Rails?** Check out our [integration page](https://github.com/Semantic-Org/Semantic-UI/wiki/Integration)


## Contributing
* **Missing documentation in your language?** Help us make Semantic available in more languages by [joining our translation community](https://www.transifex.com/organization/semantic-org/)
* **Want to help with integration?** Projects are organizing for official [Meteor](https://github.com/Semantic-Org/Semantic-UI-Meteor), and [Angular](https://github.com/Semantic-Org/Semantic-UI-Angular) integrations as well as a [Sass](https://github.com/Semantic-Org/Semantic-UI-SASS) port. Join the discussion on their respective boards.
* **Want to help others learn concepts behind Semantic?** [Learnsemantic.com](http://www.learnsemantic.com) needs articles to help others get others up to speed with Semantic UI. [Send me an e-mail](mailto:jack@semantic-ui.com) if you are interested.


## Getting Started

### Basic Usage (Default Theme)

We recommend setting up the Semantic build workflow to support on-the-fly
theming and customization, but it is not required.

To use the "ready-to-use" distribution version, which includes all components, simply link to
`dist/semantic.js` and `dist/semantic.css` (or their minified counterparts) in your page.

``` html
<link rel="stylesheet" type="text/css" href="/dist/semantic.min.css">
<script src="/dist/semantic.min.js"></script>
```

You may also prefer to use individual components found in `dist/components` to reduce the libraries file size.

``` html
<link rel="stylesheet" type="text/css" href="/dist/components/icon.css">
```


### Recommended Usage (Themed)

Semantic is best used actively during development. We have included build tools for updating your site's theme as you work.

![Getting Started](https://dl.dropboxusercontent.com/u/2657007/install.gif)

```
npm install
gulp
```

Running gulp for the first time will start the interactive set-up.

This helps you create two important files ``semantic.json`` which stores your folder set-up, and ``themes.config`` a central file for setting ui themes.

The install utility will also help you set-up which components you want to include in your packaged release, ignoring parts of Semantic you may not use.

Once set-up you can use these commands to maintain your project
```nodejs
gulp  // defaults to watch after install
gulp build // build all files from source
gulp clean // clears your dist folder
gulp watch // watch files
gulp install // re-runs install
gulp help // list all commands
```

For more detail into how work with Semantic when building a site please [read out customization guide](http://learnsemantic.com/developing/customizing.html) on [LearnSemantic.com](http://learnsemantic.com/)


## Browser Support

* Last 2 Versions FF, Chrome, IE (aka 10+)
* Safari 6
* IE 9+ (Browser prefix only)
* Android 4
* Blackberry 10


## Pull Requests

When adding pull requests be sure to merge into [next](https://github.com/Semantic-Org/Semantic-UI/tree/next) branch. If you need to demonstrate a fix in ``next`` release, you can use [this jsfiddle](http://jsfiddle.net/rduvhn8u/1/)

## Reaching Out

If you'd like to start a conversation about Semantic feel free to reach out by e-mail [jack@semantic-ui.com](mailto:jack@semantic-ui.com)

[![Flattr This](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=jlukic&url=https%3A%2F%2Fgithub.com%2Fjlukic%2FSemantic-UI)

