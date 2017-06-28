# Contributing to Semantic UI

### Usage Questions

Questions about usage should be asked in our [Gitter chatroom](https://gitter.im/Semantic-Org/Semantic-UI), on [Semantic UI forums](http://forums.semantic-ui.com) or [StackOverflow](http://stackoverflow.com/questions/tagged/semantic-ui).

Examples of usage questions
* *Why isnt my code working?*
* *Can Semantic UI do this?*

Once you receive feedback through community channels you may find your question is actually a bug. At this point it's a good idea to submit it as a bug report. Just keep in mind the following suggestions.

### Creating Bug Reports

[Github Issues Tracker](https://github.com/Semantic-Org/Semantic-UI/issues) is used to track all upcoming milestones and changes to the project.

**Please create a fork of this [jsfiddle](http://jsfiddle.net/efp8z6Ln/) to demonstrate bugs.**

When submiting a bug report, include a set of steps to reproduce the issue and any related information, browser, OS etc. If we can't reproduce the issue then it will make solving things much more difficult.

If your bug uses a third party framework like Ember, Meteor, or Angular. Be sure to submit the issue to their respective issues boards. If you are confident the bug is part of the 'vanilla' SUI release, keep in mind not all maintainers are familiar with all framework and a simple test case is greatly appreciated.

If your bug is reproduced by a maintainer it will be assigned the [`confirmed bug`](https://github.com/Semantic-Org/Semantic-UI/issues?q=is%3Aopen+is%3Aissue+label%3A%22Confirmed+Bug%22) tag. Browsing this tag is a good way to keep track of known issues with SUI.

#### Naming Issues

Semantic UI boards use a special naming convention to help tag issue titles by the component the issue is related to.

##### Bugs
Please tag titles in the format "[Component] *Sub-type* should do *correct behavior*". Please use standard [title case](http://www.titlecase.com) for titles, including the bracketed tag.

For example
* [Dropdown] Multiple Selection Should Preserve "Set Selected" Order
* [Validation] - E-mail Validation Should Handle Cyrillic
* [Button] - Grouped Buttons Should Display Correctly on Mobile

##### Enhancements

For new feature requests, you can use the format "[Component] Add *new feature*"

For example
* [Dropdown] Add "Clearable" Setting
* [Validation] Add Rules for Zipcode Validation
* [API] Add "onProgress" callback setting


### Tracking Issue Progress

As bugs and features are triaged they will be assigned to milestones. The best indication of when a change will land is to check the date on the  [upcoming milestones](https://github.com/Semantic-Org/Semantic-UI/milestones) page.

### Creating Pull Requests

**All pull requests should be merged into the `next` branch.**

Anyone can jump on the issues board and grab off bugs to fix. This is probably the best way to become a contributor to Semantic. Be sure to adhere to the style guides when submitting code.

* [Create a Pull Request](https://github.com/Semantic-Org/Semantic-UI/compare)
* [View Open Issues](https://github.com/Semantic-Org/Semantic-UI/issues)
