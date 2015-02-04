/*******************************
          GitHub Login
*******************************/
/*
  Logs into GitHub using OAuth
*/

var
  fs        = require('fs'),
  githubAPI = require('github'),

  // stores oauth info for GitHub API
  oAuth     = fs.existsSync('./oauth.js')
    ? require('./oauth')
    : false,
  github
;

if(!oAuth) {
  console.error('Must add oauth token for GitHub in tasks/admin/oauth.js');
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

module.exports = github;