# Contributing 

## Introduction

There are a variety of ways to contribute to the development of Semantic. We are a very new project and are looking for an enthusiastic and like-minded group of core contributors. We use the lovely free project management software [Trello](https://trello.com/jack148/recommend) for keeping track of project issues and updates.

Some Trello boards are open publicly, others are limited to contributors. Anyone can share ideas for the direction of the project using our public boards.

If you are looking to be added to contributor board on Semantic and are active in development, please reach out to me by e-mail [jack@myfav.es](mailto:jack@myfav.es)

### Publicity

One of the easiest ways to support Semantic UI is to get the word out

  <script id='fbrob7c'>(function(i){var f,s=document.getElementById(i);f=document.createElement('iframe');f.src='//api.flattr.com/button/view/?uid=jlukic&button=compact&url=https%3A%2F%2Fgithub.com%2Fjlukic%2FSemantic-UI';f.title='Flattr';f.height=31;f.width=110;f.style.marginRight=10;f.style.borderWidth=0;s.parentNode.insertBefore(f,s);})('fbrob7c');</script>

<iframe src="http://ghbtns.com/github-btn.html?user=jlukic&repo=semantic=ui&type=watch&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="90" height="30"></iframe>
<iframe src="http://ghbtns.com/github-btn.html?user=jlukic&repo=semantic=ui&type=follow&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="170" height="30"></iframe>
<iframe src="http://ghbtns.com/github-btn.html?user=jlukic&repo=semantic=ui&type=fork&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="90" height="30"></iframe>

[](https://twitter.com/intent/tweet?button_hashtag=semanticui)
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>

## Making Semantic Better

### Bugs & Issues

Please submit any bugs you encounter when using the library to our [Github Issues Tracker](https://github.com/jlukic/Semantic-UI/issues?state=open).

When submiting a bug report, please include a set of steps to reproduce the issue and any related information, browser, OS etc. If we can't see the issue then it will make solving things much more difficult.

### Style Guide

Contributors should read over the coding guidelines for the project. Most importantly, the guide for language, as it is one of the most important parts about Semantic UI.

  [Language](/guide/styleguide.html)
  [CSS](/guide/cssguide.html)
  [Javascript](/guide/javascript.html)

### Pull Requests

Anyone can jump on the issues board and grab off bugs to fix. This is probably the best way to become a contributor to Semantic. Be sure to adhere to the style guides when submitting code.

*   [Create a Pull Request](https://github.com/jlukic/Semantic-UI/compare/)
*   [View Open Issues](https://github.com/jlukic/Semantic-UI/issues?state=open)

### Expanding UI

Semantic is looking for people to help contribute new core UI components, and suggest extensions for the library.

If you have suggestions for components missing from Semantic which you'd like to see in future versions please add them to our public UI Component board. The current list of upcoming components, and their current development status can be seen on the contributor UI board.

#### Visit UI Development Boards

  <div class="ui buttons">
    [Public](https://trello.com/b/Q8uTLy2T)
    [Contributor](https://trello.com/b/yVsh5Rds)
  </div>

## Specification Development

We're looking currently for ideas on the best way to expand Semantic to include both core library and third party components. This requires creating a component specification which can be used by anyone to create ui components, and a package management system (website or command line) for authors to distribute them.

These features are very important for the healthy growth of the Semantic ecosystem, and to expand the number of components available to users.

#### Visit Community Development Boards

  <div class="ui buttons">
    [Public](https://trello.com/b/FZvMsVIM)
    [Contributor](https://trello.com/b/eOoZwNBQ)
  </div>

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

  <div class="code" data-title="Installing DocPad" data-type="terminal">
    npm install -g docpad
  </div>

  <div class="code" data-title="Installing Grunt" data-type="terminal">
    npm install -g grunt-cli
  </div>

### 3) Fork Semantic

<iframe src="http://ghbtns.com/github-btn.html?user=jlukic&repo=semantic=ui&type=fork&count=true&size=large"
  allowtransparency="true" frameborder="0" scrolling="0" width="90" height="30"></iframe>

### 4) Start Your Server

It's important to note that all server code exists inside of `/node` in the project. So all commands should be run relative to that directory.

  <div class="code" data-title="Starting server locally" data-type="terminal">
    cd node
    docpad run
  </div>

Docpad should now run an instance of semantic-ui.com locally you can access at `http://localhost:9778`

## Fixing Bugs

### Watch Script

If you are working on fixing a UI component that is part of Semantic, your best bet is to work actively on the file in `/src/{type}/{elementname}/` while running a watch script from grunt. This will rebuild the docs after you make changes, so you can see if you have corrected the issue you are fixing.

To see exactly what this is doing you can check out our [commented gruntfile](https://github.com/jlukic/Semantic-UI/blob/master/node/Gruntfile.js)

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
  <div class="ui buttons">
    [Public](https://trello.com/b/FZvMsVIM)
    [Contributor](https://trello.com/b/eOoZwNBQ">Contributor)
  </div>