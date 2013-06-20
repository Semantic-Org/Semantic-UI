var Handlebars = require('./lib/handlebars');

Handlebars.registerHelper('test_helper', function() { return 'found it!' });
Handlebars.registerPartial('global_test', '{{another_dude}}');

//var template = Handlebars.compile('{{test_helper}} {{#if cruel}}Goodbye {{cruel}} {{world}}!{{/if}}');
var template = Handlebars.precompile("Dudes: {{#if foo}} {{#if nested}} {{> shared/dude}} {{/if}} {{> global_test}} {{/if}}");
console.log(template);

return;

console.log(
  template({cruel: "cruel", name:"Jeepers", another_dude:"Creepers"}, {
    helpers: {world: function() { return "world!"; }},
    partials: {'shared/dude':"{{name}}"}
  }));

console.log(template);
