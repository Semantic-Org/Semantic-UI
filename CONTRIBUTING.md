# Contributing 

## Introduction

There are a variety of ways to contribute to the development of Semantic. We are a very new project and are looking for an enthusiastic and like-minded group of core contributors. We use the lovely free project management software [Trello](https://trello.com/jack148/recommend) for keeping track of project issues and updates.

Some Trello boards are open publicly, others are limited to contributors. Anyone can share ideas for the direction of the project using our public boards.

If you are looking to be added to contributor board on Semantic and are active in development, please reach out to me by e-mail [jack@myfav.es](mailto:jack@myfav.es)

### Publicity

One of the easiest ways to support Semantic UI is to get the word out

## Making Semantic Better

### Bugs & Issues

Please submit any bugs you encounter when using the library to our [Github Issues Tracker](https://github.com/jlukic/Semantic-UI/issues?state=open).

When submiting a bug report, please include a set of steps to reproduce the issue and any related information, browser, OS etc. If we can't see the issue then it will make solving things much more difficult.

Please create a fork of this [jsfiddle](http://jsfiddle.net/pMDsH/) to demonstrate bugs.

### Style Guide

Contributors should read over the coding guidelines for the project. Most importantly, the guide for language, as it is one of the most important parts about Semantic UI.

[Language](http://semantic-ui.com/guide/styleguide.html)
[CSS](http://semantic-ui.com/guide/cssguide.html)
[Javascript](http://semantic-ui.com/guide/javascriptguide.html)

### Pull Requests

Anyone can jump on the issues board and grab off bugs to fix. This is probably the best way to become a contributor to Semantic. Be sure to adhere to the style guides when submitting code.

*   [Create a Pull Request](https://github.com/jlukic/Semantic-UI/compare/)
*   [View Open Issues](https://github.com/jlukic/Semantic-UI/issues?state=open)

### Expanding UI

Semantic is looking for people to help contribute new core UI components, and suggest extensions for the library.

If you have suggestions for components missing from Semantic which you'd like to see in future versions please add them to our public UI Component board. The current list of upcoming components, and their current development status can be seen on the contributor UI board.

#### Visit UI Development Boards

[Public](https://trello.com/b/Q8uTLy2T) |
[Contributor](https://trello.com/b/yVsh5Rds)

## Specification Development

We're looking currently for ideas on the best way to expand Semantic to include both core library and third party components. This requires creating a component specification which can be used by anyone to create ui components, and a package management system (website or command line) for authors to distribute them.

These features are very important for the healthy growth of the Semantic ecosystem, and to expand the number of components available to users.

#### Visit Community Development Boards

[Public](https://trello.com/b/FZvMsVIM) |
[Contributor](https://trello.com/b/eOoZwNBQ)

---

## Development

A guide to developing locally

## Running Locally

It may be useful to run the development docs locally when working on a forked version of semantic, as the docs themselves help in testing out changes to ui components.

### 1) Install Node

Semantic docs are written in DocPad which requires NodeJS. 

Make sure npm does not require sudo to operate, this might cause permissions issues.

*   [Node JS via Package Manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
*   [Installing Node JS without sudo](https://gist.github.com/isaacs/579814)

### 2) Install Dependencies

```bash
npm install -g docpad
docpad install eco
docpad update; docpad upgrade
```

```bash
npm install -g grunt-cli
```

### 3) Fork Semantic

[Fork](https://github.com/jlukic/Semantic-UI/fork)

### 4A) Build Semantic

In order to have the current version of semantic available inside your local documentation, you will have to build it once with Grunt

```bash
grunt build
```

### 4B) Start Your Server

```bash
docpad run
```

Docpad should now run an instance of semantic-ui.com locally you can access at `http://localhost:9778`

Note that some asset files might be missing until you run `grunt build` once.

## Fixing Bugs

### Watch Script

If you are working on fixing a UI component that is part of Semantic, your best bet is to work actively on the file in `/src/{type}/{elementname}/` while running a watch script from grunt. This will rebuild the docs after you make changes, so you can see if you have corrected the issue you are fixing.

To see exactly what this is doing you can check out our [commented gruntfile](https://github.com/jlukic/Semantic-UI/blob/master/Gruntfile.js)

```bash
grunt
```

The watch task is the default grunt task for Semantic, so you can start it quite simply.

### Packaging Elements

For convenience there is also a separate grunt command for building minified, packaged, and compressed versions of the library.

```bash
grunt build
```

## The Future

### UI Dev Kits

We are working to create development kits for writing and distributing third party UI definitions. These, are planned to land after our 1.0 release and allow other developers to contribute ui components or reskins of existing components.

For more information on the development of the UI specification for third party components, please visit our community discussion boards on Trello

#### Development Boards
[Public](https://trello.com/b/FZvMsVIM) |
[Contributor](https://trello.com/b/eOoZwNBQ)
