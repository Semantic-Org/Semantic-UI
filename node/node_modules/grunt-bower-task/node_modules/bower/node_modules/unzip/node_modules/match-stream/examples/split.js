var MatchStream = require('../');
var fs = require('fs');
var path = require('path');

var line = "";
var loremLines = [];
var ms = new MatchStream({ pattern: '.', consume: true}, function (buf, matched, extra) {
  line += buf.toString();
  if (matched) {
    loremLines.push(line.trim());
    line = "";
  }
});

fs.createReadStream(path.join(__dirname, 'lorem.txt'))
  .pipe(ms)
  .once('end', function() {
    console.log(loremLines);
  });

//Output
//[ 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
//  'Maecenas varius tempor arcu, quis hendrerit nunc accumsan quis',
//  'In ut dolor metus, eget viverra odio',
//  'Quisque sed suscipit leo',
//  'Curabitur dictum magna ut turpis interdum a mollis nunc condimentum',
//  'Praesent leo est, hendreriteget condimentum sit amet, placerat adipiscing neque',
//  'Curabitur id metus tellus, sed semper odio',
//  'Phasellus id justo ante, vel bibendum eros',
//  'Nulla suscipit felis eget erat iaculis et aliquam turpis consequat',
//  'Nunc posuere mollis tellus sit amet dapibus',
//  'Praesent sagittis quam sit amet mauris venenatis in dignissim purus dapibus' ]