/*******************************
        Install Questions
*******************************/

var defaults, fs, filter, when;

fs       = require('fs');
defaults = require('../defaults');

filter = {
  removeTrailingSlash: function(path) {
    return path.replace(/(\/$|\\$)+/mg, '');
  }
};

when = {


};

module.exports = {

  docs: [
    {
      type: 'list',
      name: 'action',
      message: 'How should we provide files to docs?',
      choices: [
        {
          name: 'Watch changes',
          value: 'docs-serve'
        },
        {
          name: 'Build all files',
          value: 'docs-build'
        }
      ]
    }
  ],

  createRepo: [
    {
      type: 'confirm',
      name: 'allow',
      message: 'Create new repo?',
      default: true
    }
  ]

};