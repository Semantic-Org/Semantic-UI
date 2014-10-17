/*******************************
         Set-up Questions
*******************************/

var defaults = require('./defaults');

module.exports = {

  setup: [
    {
      type: 'list',
      name: 'install',
      message: 'First run: Set-up Semantic UI',
      choices: [
        'Automatic (Use defaults locations and all packages)',
        'Express (Set components and output folder)',
        'Custom (Customize all config values)'
      ]
    },
    {
      type: 'input',
      name: 'site',
      message: 'Where should we put your site folder?',
      default: defaults.paths.source.site
    },
    {
      type: 'input',
      name: 'config',
      message: 'Where should we put your semantic.config file?',
      default: defaults.paths.source.config
    },
    {
      type: 'input',
      name: 'dest',
      message: 'Where should we compile semantic to?',
      default: defaults.paths.output.packaged
    },
    {
      type: 'input',
      name: 'dest',
      message: 'Where should we output compressed components?',
      default: defaults.paths.output.compressed
    },
    {
      type: 'input',
      name: 'dest',
      message: 'Where should we output uncompressed components?',
      default: defaults.paths.output.uncompressed
    },
    {
      type: 'checkbox',
      name: 'components',
      message: 'What components should we include in the package? (Toggle with spacebar)',
      choices: [
        {name: "Button", checked: true },
        {name: "Divider", checked: true },
        {name: "Flag", checked: true },
        {name: "Header", checked: true },
        {name: "Icon", checked: true },
        {name: "Image", checked: true },
        {name: "Input", checked: true },
        {name: "Label", checked: true },
        {name: "List", checked: true },
        {name: "Loader", checked: true },
        {name: "Rail", checked: true },
        {name: "Reveal", checked: true },
        {name: "Segment", checked: true },
        {name: "Step", checked: true },
        {name: "Breadcrumb", checked: true },
        {name: "Form", checked: true },
        {name: "Grid", checked: true },
        {name: "Menu", checked: true },
        {name: "Message", checked: true },
        {name: "Table", checked: true },
        {name: "Card", checked: true },
        {name: "Comment", checked: true },
        {name: "Feed", checked: true },
        {name: "Item", checked: true },
        {name: "Statistic", checked: true },
        {name: "Accordion", checked: true },
        {name: "Checkbox", checked: true },
        {name: "Dimmer", checked: true },
        {name: "Dropdown", checked: true },
        {name: "Modal", checked: true },
        {name: "Nag", checked: true },
        {name: "Popup", checked: true },
        {name: "Progress", checked: true },
        {name: "Rating", checked: true },
        {name: "Search", checked: true },
        {name: "Shape", checked: true },
        {name: "Sidebar", checked: true },
        {name: "Sticky", checked: true },
        {name: "Tab", checked: true },
        {name: "Transition", checked: true },
        {name: "Video", checked: true },
        {name: "Api", checked: true },
        {name: "Form ", checked: true }
      ]
    }
  ]

};