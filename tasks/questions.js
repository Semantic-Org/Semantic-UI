/*******************************
        Install Questions
*******************************/

var defaults, fs, filter, when;

fs       = require('fs');
defaults = require('./defaults');

filter = {
  removeTrailingSlash: function(path) {
    return path.replace(/(\/$|\\$)+/mg, '');
  }
};

when = {

  // set-up
  hasConfig: function() {
    return( fs.existsSync('./semantic.json') );
  },
  allowOverwrite: function(questions) {
    return (questions.overwrite === undefined || questions.overwrite == 'yes');
  },
  notAuto: function(questions) {
    return (questions.install !== 'auto' && (questions.overwrite === undefined || questions.overwrite == 'yes'));
  },
  custom: function(questions) {
    return (questions.install === 'custom' && (questions.overwrite === undefined || questions.overwrite == 'yes'));
  },
  express: function(questions) {
    return (questions.install === 'express' && (questions.overwrite === undefined || questions.overwrite == 'yes'));
  },

  // customize
  customize: function(questions) {
    return (questions.customize === true);
  },
  primaryColor: function(questions) {
    return (questions.primaryColor);
  },
  secondaryColor: function(questions) {
    return (questions.secondaryColor);
  }
};

module.exports = {

  setup: [
    {
      type: 'list',
      name: 'overwrite',
      message: 'It looks like you have a semantic.json file already.',
      when: when.hasConfig,
      choices: [
        {
          name: 'Yes, extend my current settings.',
          value: 'yes'
        },
        {
          name: 'Skip install',
          value: 'no'
        }
      ]
    },
    {
      type: 'list',
      name: 'install',
      message: 'Set-up Semantic UI',
      when: when.allowOverwrite,
      choices: [
        {
          name: 'Automatic (Use defaults locations and all components)',
          value: 'auto'
        },
        {
          name: 'Express (Set components and output folder)',
          value: 'express'
        },
        {
          name: 'Custom (Customize all src/dist values)',
          value: 'custom'
        }
      ]
    },
    {
      type: 'checkbox',
      name: 'components',
      message: 'What components should we include in the package?',
      choices: [
        { name: "reset", checked: true },
        { name: "site", checked: true },
        { name: "button", checked: true },
        { name: "divider", checked: true },
        { name: "flag", checked: true },
        { name: "header", checked: true },
        { name: "icon", checked: true },
        { name: "image", checked: true },
        { name: "input", checked: true },
        { name: "label", checked: true },
        { name: "list", checked: true },
        { name: "loader", checked: true },
        { name: "rail", checked: true },
        { name: "reveal", checked: true },
        { name: "segment", checked: true },
        { name: "step", checked: true },
        { name: "breadcrumb", checked: true },
        { name: "form", checked: true },
        { name: "grid", checked: true },
        { name: "menu", checked: true },
        { name: "message", checked: true },
        { name: "table", checked: true },
        { name: "card", checked: true },
        { name: "comment", checked: true },
        { name: "feed", checked: true },
        { name: "item", checked: true },
        { name: "statistic", checked: true },
        { name: "accordion", checked: true },
        { name: "checkbox", checked: true },
        { name: "dimmer", checked: true },
        { name: "dropdown", checked: true },
        { name: "modal", checked: true },
        { name: "nag", checked: true },
        { name: "popup", checked: true },
        { name: "progress", checked: true },
        { name: "rating", checked: true },
        { name: "search", checked: true },
        { name: "shape", checked: true },
        { name: "sidebar", checked: true },
        { name: "sticky", checked: true },
        { name: "tab", checked: true },
        { name: "transition", checked: true },
        { name: "video", checked: true },
        { name: "api", checked: true },
        { name: "form", checked: true }
      ],
      when: when.notAuto
    },
    {
      type: 'input',
      name: 'dist',
      message: 'Where should we output Semantic UI?',
      default: defaults.paths.output.packaged,
      filter: filter.removeTrailingSlash,
      when: when.express
    },
    {
      type: 'input',
      name: 'site',
      message: 'Where should we put your site folder?',
      default: defaults.paths.source.site,
      filter: filter.removeTrailingSlash,
      when: when.custom
    },
    {
      type: 'input',
      name: 'packaged',
      message: 'Where should we output a packaged version?',
      default: defaults.paths.output.packaged,
      filter: filter.removeTrailingSlash,
      when: when.custom
    },
    {
      type: 'input',
      name: 'compressed',
      message: 'Where should we output compressed components?',
      default: defaults.paths.output.compressed,
      filter: filter.removeTrailingSlash,
      when: when.custom
    },
    {
      type: 'input',
      name: 'uncompressed',
      message: 'Where should we output uncompressed components?',
      default: defaults.paths.output.uncompressed,
      filter: filter.removeTrailingSlash,
      when: when.custom
    }
  ],


  cleanup: [
    {
      type: 'list',
      name: 'cleanup',
      message: 'Should we remove set-up files?',
      choices: [
        {
          name: 'Yes (re-install will require redownloading semantic).',
          value: 'yes'
        },
        {
          name: 'No Thanks',
          value: 'no'
        }
      ]
    },
    {
      type: 'list',
      name: 'build',
      message: 'Do you want to build Semantic now?',
      choices: [
        {
          name: 'Yes',
          value: 'yes'
        },
        {
          name: 'No',
          value: 'no'
        }
      ]
    },
  ],
  site: [
    {
      type: 'list',
      name: 'customize',
      message: 'You have not yet customized your site, can we help you do that?',
      choices: [
        {
          name: 'Yes, ask me a few questions',
          value: true
        },
        {
          name: 'No I\'ll do it myself',
          value: false
        }
      ]
    },
    {
      type: 'list',
      name: 'headerFont',
      message: 'Select your header font',
      choices: [
        {
          name: 'Helvetica Neue, Arial, sans-serif',
          value: 'Helvetica Neue, Arial, sans-serif;'
        },
        {
          name: 'Lato (Google Fonts)',
          value: 'Lato'
        },
        {
          name: 'Open Sans (Google Fonts)',
          value: 'Open Sans'
        },
        {
          name: 'Source Sans Pro (Google Fonts)',
          value: 'Source Sans Pro'
        },
        {
          name: 'Droid (Google Fonts)',
          value: 'Droid'
        },
        {
          name: 'I\'ll choose on my own',
          value: false
        }
      ],
      when: when.customize
    },
    {
      type: 'list',
      name: 'pageFont',
      message: 'Select your page font',
      choices: [
        {
          name: 'Helvetica Neue, Arial, sans-serif',
          value: 'Helvetica Neue, Arial, sans-serif;'
        },
        {
          name: 'Lato (Import from Google Fonts)',
          value: 'Lato'
        },
        {
          name: 'Open Sans (Import from Google Fonts)',
          value: 'Open Sans'
        },
        {
          name: 'Source Sans Pro (Import from Google Fonts)',
          value: 'Source Sans Pro'
        },
        {
          name: 'Droid (Google Fonts)',
          value: 'Droid'
        },
        {
          name: 'I\'ll choose on my own',
          value: false
        }
      ],
      when: when.customize
    },
    {
      type: 'list',
      name: 'fontSize',
      message: 'Select your base font size',
      default: '14px',
      choices: [
        {
          name: '12px',
        },
        {
          name: '13px',
        },
        {
          name: '14px (Recommended)',
          value: '14px'
        },
        {
          name: '15px',
        },
        {
          name: '16px',
        },
        {
          name: 'I\'ll choose on my own',
          value: false
        }
      ],
      when: when.customize
    },
    {
      type: 'list',
      name: 'primaryColor',
      message: 'Select the closest name for your primary brand color',
      default: '14px',
      choices: [
        {
          name: 'Blue'
        },
        {
          name: 'Green'
        },
        {
          name: 'Orange'
        },
        {
          name: 'Pink'
        },
        {
          name: 'Purple'
        },
        {
          name: 'Red'
        },
        {
          name: 'Teal'
        },
        {
          name: 'Yellow'
        },
        {
          name: 'Black'
        },
        {
          name: 'None really fit',
          value: 'custom'
        },
        {
          name: 'I\'ll choose on my own',
          value: false
        }
      ],
      when: when.customize
    },
    {
      type: 'input',
      name: 'PrimaryHex',
      message: 'Enter a hexcode for your primary brand color',
      when: when.primaryColor
    },
    {
      type: 'list',
      name: 'secondaryColor',
      message: 'Select the closest name for your secondary brand color',
      default: '14px',
      choices: [
        {
          name: 'Blue'
        },
        {
          name: 'Green'
        },
        {
          name: 'Orange'
        },
        {
          name: 'Pink'
        },
        {
          name: 'Purple'
        },
        {
          name: 'Red'
        },
        {
          name: 'Teal'
        },
        {
          name: 'Yellow'
        },
        {
          name: 'Black'
        },
        {
          name: 'None really fit',
          value: 'custom'
        },
        {
          name: 'I\'ll choose on my own',
          value: false
        }
      ],
      when: when.customize
    },
    {
      type: 'input',
      name: 'secondaryHex',
      message: 'Enter a hexcode for your secondary brand color',
      when: when.secondaryColor
    }
  ]

};