// Check that the font files are downloadable. Meteor places assets at /packages/<packageName>/.
['eot', 'otf', 'svg', 'ttf', 'woff'].forEach(function (ext) {
  Tinytest.addAsync(ext + ' fonts are shipped', function (test, done) {
    HTTP.get('/packages/semantic_ui/dist/themes/default/assets/fonts/icons.' + ext, function callback(error, result) {
      if (error) {
        test.fail({message: 'Font failed to load'});
      } else {
        test.isTrue(result.content.length > 10000, ext + ' font could not be downloaded');
      }

      done();
    });
  });
});