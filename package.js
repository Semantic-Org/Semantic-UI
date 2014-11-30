Package.describe({
  name: 'semantic:ui',
  summary: 'Semantic empowers designers and developers by creating a shared vocabulary for UI.',
  version: '1.0.1',
  git: 'git://github.com/Semantic-Org/Semantic-UI.git#1.0'
});

var where = 'client'; // Adds files only to the client

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
    'dist/themes/default/assets/images/flags.png',
  ], where);
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'http',
    'semantic:ui'
  ], where);
  api.use([
    'semantic:ui'
  ], 'server');

  api.addFiles([
    'meteor/tests/test_fonts.js',
    'meteor/tests/test_images.js',
  ], where);
});
