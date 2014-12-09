/*******************************
          Default Paths
*******************************/

module.exports = {
  base       : '',

  theme      : './src/theme.config',

  docs       : {
    source : '../docs/server/files/release/',
    output : '../docs/release/'
  },

  title      : 'Semantic UI',
  repository : 'https://github.com/Semantic-Org/Semantic-UI',
  url        : 'http://www.semantic-ui.com/',

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

  regExp: {
    themePath: /.*\/themes\/.*?\//mg
  },

  // folder pathsr
  folders: {
    config : './',
    site   : './src/site',
    theme  : './src/'
  },

  // file paths
  files: {
    composer : 'composer.json',
    config   : './semantic.json',
    npm      : './package.json',
    site     : './src/site',
    theme    : './src/theme.config'
  },

  // same as semantic.json.example
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
  }
};