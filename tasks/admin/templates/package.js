Package.describe({
  name: 'semantic:ui',
  summary: 'Semantic empowers designers and developers by creating a shared vocabulary for UI.',
  version: '{package-version}',
  git: 'git://github.com/Semantic-Org/Semantic-UI.git#1.0',
  readme: 'https://github.com/Semantic-Org/Semantic-UI/blob/1.0/meteor/README.md'
});

var where = 'client'; // Adds files only to the client

Package.onUse(function(api) {
  api.versionsFrom('1.0');

  api.addFiles([{package-files}
  ], where);
});

Package.onTest(function(api) {
  api.use([
    'tinytest',
    'http',
    'semantic:ui'
  ], where);

  api.addFiles([
    'meteor/tests/test_fonts.js',
    'meteor/tests/test_images.js',
  ], where);
});
