var assets = [
	'dist/themes/default/assets/images/flags.png',
];

// Check that the font files are downloadable. Meteor places assets at /packages/<packageName>/.
assets.forEach(function (path) {
  Tinytest.addAsync('image ' + path + ' is shipped', function (test, done) {
    HTTP.get('/packages/semantic_ui/' + path, function callback(error, result) {
      if (error) {
        test.fail({message: 'Image failed to load'});
      }
      else {
        test.isTrue(result.content.length > 10000, 'Image ' + path + ' could not be downloaded');
      }
      done();
    });
  });
});


