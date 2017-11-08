/*******************************
             Docs
*******************************/

/* Paths used for "serve-docs" and "build-docs" tasks */
module.exports = {
  base: '',
  globs: {
    eco: '**/*.html.eco'
  },
  paths: {
    clean: './out/dist/',
    source: {
      config      : 'src/theme.config',
      definitions : 'src/definitions/',
      site        : 'src/site/',
      themes      : 'src/themes/'
    },
    output: {
      examples     : './out/examples/',
      less         : './out/src/',
      metadata     : './out/',
      packaged     : './out/dist/',
      uncompressed : './out/dist/components/',
      compressed   : './out/dist/components/',
      themes       : './out/dist/themes/'
    },
    template: {
      eco: './server/documents/'
    },
  }
};
