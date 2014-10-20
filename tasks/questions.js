/*******************************
        Install Questions
*******************************/

var defaults, when;

defaults = require('./defaults');

when = {
  notAuto: function(questions) {
    console.log(questions.install);
    return (questions.install !== 'auto');
  },
  custom: function(questions) {
    return (questions.install === 'custom');
  },
  express: function(questions) {
    return (questions.install === 'express');
  },
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
      name: 'install',
      message: 'Set-up Themed Semantic UI (First-Run)',
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
      message: 'What components should we include in the package? (Toggle with spacebar)',
      choices: [
        { name: "Button", checked: true },
        { name: "Divider", checked: true },
        { name: "Flag", checked: true },
        { name: "Header", checked: true },
        { name: "Icon", checked: true },
        { name: "Image", checked: true },
        { name: "Input", checked: true },
        { name: "Label", checked: true },
        { name: "List", checked: true },
        { name: "Loader", checked: true },
        { name: "Rail", checked: true },
        { name: "Reveal", checked: true },
        { name: "Segment", checked: true },
        { name: "Step", checked: true },
        { name: "Breadcrumb", checked: true },
        { name: "Form", checked: true },
        { name: "Grid", checked: true },
        { name: "Menu", checked: true },
        { name: "Message", checked: true },
        { name: "Table", checked: true },
        { name: "Card", checked: true },
        { name: "Comment", checked: true },
        { name: "Feed", checked: true },
        { name: "Item", checked: true },
        { name: "Statistic", checked: true },
        { name: "Accordion", checked: true },
        { name: "Checkbox", checked: true },
        { name: "Dimmer", checked: true },
        { name: "Dropdown", checked: true },
        { name: "Modal", checked: true },
        { name: "Nag", checked: true },
        { name: "Popup", checked: true },
        { name: "Progress", checked: true },
        { name: "Rating", checked: true },
        { name: "Search", checked: true },
        { name: "Shape", checked: true },
        { name: "Sidebar", checked: true },
        { name: "Sticky", checked: true },
        { name: "Tab", checked: true },
        { name: "Transition", checked: true },
        { name: "Video", checked: true },
        { name: "Api", checked: true },
        { name: "Form ", checked: true }
      ],
      when: when.notAuto
    },
    {
      type: 'input',
      name: 'dist',
      message: 'Where should we output Semantic UI?',
      default: defaults.paths.output.packaged,
      when: when.express
    },
    {
      type: 'input',
      name: 'site',
      message: 'Where should we put your site folder?',
      default: defaults.paths.source.site,
      when: when.custom
    },
    {
      type: 'input',
      name: 'packaged',
      message: 'Where should we output a packaged version?',
      default: defaults.paths.output.packaged,
      when: when.custom
    },
    {
      type: 'input',
      name: 'compressed',
      message: 'Where should we output compressed components?',
      default: defaults.paths.output.compressed,
      when: when.custom
    },
    {
      type: 'input',
      name: 'uncompressed',
      message: 'Where should we output uncompressed components?',
      default: defaults.paths.output.uncompressed,
      when: when.custom
    }
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