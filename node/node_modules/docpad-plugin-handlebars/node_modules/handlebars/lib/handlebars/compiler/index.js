// Each of these module will augment the Handlebars object as it loads. No need to perform addition operations
module.exports.attach = function(Handlebars) {

var visitor = require("./visitor"),
    printer = require("./printer"),
    ast = require("./ast"),
    compiler = require("./compiler");

visitor.attach(Handlebars);
printer.attach(Handlebars);
ast.attach(Handlebars);
compiler.attach(Handlebars);

return Handlebars;

};
