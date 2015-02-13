var
  where = 'client' // Adds files only to the client
;

Package.describe({
  git     : 'git://github.com/Semantic-Org/Semantic-UI.git',
  name    : 'semantic:ui',
  readme  : 'https://github.com/Semantic-Org/Semantic-UI/blob/master/meteor/README.md',
  summary : 'Semantic (official): a UI component framework based around useful principles from natural language.',
  version : '1.7.0'
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles([
    'dist/semantic.css',
    'dist/semantic.js',
    'dist/themes/default/assets/fonts/icons.eot',
    'dist/themes/default/assets/fonts/icons.otf',
    'dist/themes/default/assets/fonts/icons.svg',
    'dist/themes/default/assets/fonts/icons.ttf',
    'dist/themes/default/assets/fonts/icons.woff',
    'dist/themes/default/assets/images/flags.png'
  ], where);
});

Package.onTest(function(api) {
  api.use([
    'http',
    'semantic:ui',
    'tinytest'
  ], where);

  api.addFiles([
    'test/meteor/assets.js',
    'test/meteor/fonts.js',
  ], where);
});
