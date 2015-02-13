var
  where = 'client' // Adds files only to the client
;

Package.describe({
  name    : 'semantic:ui-{component}',
  summary : 'Semantic UI - {Component} (official): Single component release of {component}',
  version : '{version}',
  git     : 'git://github.com/Semantic-Org/UI-{Component}.git',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles([
    {files}
  ], where);
});
