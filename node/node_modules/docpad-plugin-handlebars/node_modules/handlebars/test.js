var Handlebars = require('./lib/handlebars');

var succeedingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}}  {{#blk}} Expected {{/blk}} {{/inverse}}';
var failingTemplate = '{{#inverse}} {{#blk}} Unexpected {{/blk}} {{else}} {{#blk}} Expected {{/blk}} {{/inverse}}';

console.log(Handlebars.precompile(failingTemplate));

var helpers = {
  blk: function(block) { return block.fn(''); },
  inverse: function(block) { return block.inverse(''); }
};

function output(template_string) {
  var compiled = Handlebars.compile(template_string);
  var out = compiled({}, {helpers: helpers});
  console.log(out);
}


output(failingTemplate); // output: Unexpected
