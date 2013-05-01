var burrito = require('burrito');

var res = burrito.microwave('Math.sin(2)', function (node) {
    console.dir(node);
    if (node.name === 'num') node.wrap('Math.PI / %s');
});

console.log(res); // sin(pi / 2) == 1
