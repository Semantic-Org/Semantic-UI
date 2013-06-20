var Handlebars = require('./lib/handlebars');

var template = Handlebars.compile('{{#if unless}}foo{{/if}}');
console.log(template({ foo: function() { return 'bar'; } }));
