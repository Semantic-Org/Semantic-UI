/* Release All */
gulp.task('release all', false, function() {

  if(!oAuth) {
    console.error('Must add node include tasks/admin/oauth.js with oauth token for GitHub');
    return;
  }

  github = new githubAPI({
    version    : '3.0.0',
    debug      : true,
    protocol   : 'https',
    timeout    : 5000
  });

  github.authenticate({
    type: 'oauth',
    token: oAuth.token
  });

  // gulp build
  runSequence(
    'build',
    'create components',
    'update component repos'
  );

});