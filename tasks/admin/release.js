/*******************************
        Release Settings
*******************************/

// release settings
module.exports = {

  // path to components for repos
  source     : './dist/components/',

  templates: {
    bower   : './tasks/admin/templates/bower.json',
    package : './tasks/admin/templates/package.json',
    notes   : './RELEASE-NOTES.md'
  },

  org        : 'Semantic-Org',
  repo       : 'Semantic-UI',

  // root name for repos
  repoRoot   : 'UI-',
  // root path to repos
  outputRoot : '../components/',

  homepage   : 'http://beta.semantic-ui.com',


  // components that get separate repositories for bower/npm
  components : [
    "accordion",
    "api",
    "breadcrumb",
    "button",
    "card",
    "checkbox",
    "comment",
    "dimmer",
    "divider",
    "dropdown",
    "feed",
    "flag",
    "form",
    "grid",
    "header",
    "icon",
    "image",
    "input",
    "item",
    "label",
    "list",
    "loader",
    "menu",
    "message",
    "modal",
    "nag",
    "popup",
    "progress",
    "rail",
    "rating",
    "reset",
    "reveal",
    "search",
    "segment",
    "shape",
    "sidebar",
    "site",
    "statistic",
    "step",
    "sticky",
    "tab",
    "table",
    "transition",
    "video"
  ]
};

