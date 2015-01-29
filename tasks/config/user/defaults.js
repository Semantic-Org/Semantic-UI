/*******************************
          Default Paths
*******************************/

module.exports = {

  // base path added to all other paths
  base : '',

  // octal permission for output files, i.e. 644 (false does not adjust)
  permission : false,

  // whether to generate rtl files
  rtl        : false,

  // folder paths
  paths: {
    source: {
      config      : 'src/theme.config',
      definitions : 'src/definitions/',
      site        : 'src/site/',
      themes      : 'src/themes/'
    },
    output: {
      packaged     : 'dist/',
      uncompressed : 'dist/components/',
      compressed   : 'dist/components/',
      themes       : 'dist/themes/'
    },
    clean : 'dist/'
  },

  // globs
  globs      : {
    // files ignored for concatenated release
    ignored : '!(*.min|*.map|*.rtl)'
  },

  components: [
    // global
    'reset',
    'site',
    // elements
    'button',
    'divider',
    'flag',
    'header',
    'icon',
    'image',
    'input',
    'label',
    'list',
    'loader',
    'rail',
    'reveal',
    'segment',
    'step',
    // collections
    'breadcrumb',
    'form',
    'grid',
    'menu',
    'message',
    'table',
    // views
    'ad',
    'card',
    'comment',
    'feed',
    'item',
    'statistic',
    // modules
    'accordion',
    'checkbox',
    'dimmer',
    'dropdown',
    'modal',
    'nag',
    'popup',
    'progress',
    'rating',
    'search',
    'shape',
    'sidebar',
    'sticky',
    'tab',
    'transition',
    'video',
    // behaviors
    'api',
    'form',
    'state',
    'visibility'
  ],

  /* Install Move */
  files: {
    composer : 'composer.json',
    config   : './semantic.json',
    npm      : './package.json',
    meteor   : './package.js',
    site     : './src/site',
    theme    : './src/theme.config'
  },

  // path to theme.config from project root
  themePath  : './src/theme.config',

  // whether to load admin tasks
  admin: false,

  docs : {
    source : '../docs/server/files/release/',
    output : '../docs/release/'
  },

  // files cleaned after install
  setupFiles: [
    './src/theme.config.example',
    './semantic.json.example',
    './src/_site'
  ],


  // modified to create configs
  templates: {
    config : './semantic.json.example',
    site   : './src/_site',
    theme  : './src/theme.config.example'
  },

  // folder paths
  folders: {
    config : './',
    site   : './src/site',
    theme  : './src/'
  }
};
