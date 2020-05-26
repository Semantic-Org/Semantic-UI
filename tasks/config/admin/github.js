/*******************************
          GitHub Login
*******************************/
/*
  Logs into GitHub using OAuth
*/

var
  fs          = require('fs'),
  path        = require('path'),
  { Octokit } = require('@octokit/rest'),

  // stores oauth info for GitHub API
  oAuthConfig = path.join(__dirname, 'oauth.js'),
  oAuth       = fs.existsSync(oAuthConfig)
    ? require(oAuthConfig)
    : false,
  github
;

if(!oAuth) {
  console.error('Must add oauth token for GitHub in tasks/config/admin/oauth.js');
}

github = new Octokit({
  version   : '3.0.0',
  auth      : oAuth.token,
  userAgent : 'Semantic-Org-Pusher-Bot',
  timeout    : 5000
});

module.exports = github;
