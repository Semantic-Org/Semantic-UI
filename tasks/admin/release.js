/*******************************
        Release Settings
*******************************/

// release settings
module.exports = {

  // path to components for repos
  source     : './dist/components/',

  // modified asset paths for component repos
  paths: {
    source : '../themes/default/assets/',
    output : 'assets/'
  },

  templates: {
    bower    : './tasks/admin/templates/bower.json',
    composer : './tasks/admin/templates/composer.json',
    package  : './tasks/admin/templates/package.json',
    readme   : './tasks/admin/templates/README.md',
    notes    : './RELEASE-NOTES.md'
  },

  org         : 'Semantic-Org',
  repo        : 'Semantic-UI',

  // root name for repos
  repoRoot    : 'UI-',
  packageRoot : 'semantic-ui-',

  // root path to repos
  outputRoot  : '../components/',

  homepage    : 'http://www.semantic-ui.com',

  // components that get separate repositories for bower/npm
  components : [
    'accordion',
    'api',
    'breadcrumb',
    'button',
    'card',
    'checkbox',
    'comment',
    'dimmer',
    'divider',
    'dropdown',
    'feed',
    'flag',
    'form',
    'grid',
    'header',
    'icon',
    'image',
    'input',
    'item',
    'label',
    'list',
    'loader',
    'menu',
    'message',
    'modal',
    'nag',
    'popup',
    'progress',
    'rail',
    'rating',
    'reset',
    'reveal',
    'search',
    'segment',
    'shape',
    'sidebar',
    'site',
    'statistic',
    'step',
    'sticky',
    'tab',
    'table',
    'transition',
    'video'
  ]
};

