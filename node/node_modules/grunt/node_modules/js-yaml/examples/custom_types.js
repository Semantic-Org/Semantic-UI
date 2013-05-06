'use strict';


var fs   = require('fs');
var path = require('path');
var util = require('util');
var yaml = require('../lib/js-yaml');


// Let define a couple of classes...

function Point(x, y, z) {
  this.klass = 'Point';
  this.x     = x;
  this.y     = y;
  this.z     = z;
}


function Space(height, width, points) {
  if (points) {
    if (!points.every(function (point) { return point instanceof Point; })) {
      throw new Error('A non-Point inside a points array!');
    }
  }

  this.klass  = 'Space';
  this.height = height;
  this.width  = width;
  this.points = points;
}


// Let define YAML types to load and dump our Point/Space objects.

var pointYamlType = new yaml.Type('!point', {
  // The information used to load a Point.
  loader: {
    kind: 'array', // It must be an array. (sequence in YAML)
    resolver: function (object) {
      // It must contain exactly tree elements.
      if (3 === object.length) {
        return new Point(object[0], object[1], object[2]);

      // Otherwise, it is NOT a Point.
      } else {
        return yaml.NIL;
      }
    }
  },
  // The information used to dump a Point.
  dumper: {
    kind: 'object', // It must be an object but not an array.
    instanceOf: Point, // Also, it must be an instance of Point class.
    representer: function (point) {
      // And it should be represented in YAML as three-element sequence.
      return [ point.x, point.y, point.z ];
    }
  }
});


var spaceYamlType = new yaml.Type('!space', {
  loader: {
    kind: 'object', // 'object' here means 'mapping' in YAML.
    resolver: function (object) {
      return new Space(object.height, object.width, object.points);
    }
  },
  dumper: {
    kind: 'object',
    instanceOf: Space
    // The representer is omitted here. So, Space objects will be dumped as is.
    // That is regular mapping with three key-value pairs but with !space tag.
  }
});


// After our types are defined, it's time to join them into a schema.

var SPACE_SCHEMA = yaml.Schema.create([ spaceYamlType, pointYamlType ]);


// And read a document using that schema.

fs.readFile(path.join(__dirname, 'custom_types.yaml'), 'utf8', function (error, data) {
  var loaded;

  if (!error) {
    loaded = yaml.load(data, { schema: SPACE_SCHEMA });
    console.log(util.inspect(loaded, false, 20, true));
  } else {
    console.error(error.stack || error.message || String(error));
  }
});


// There are some exports to play with this example interactively.

module.exports.Point         = Point;
module.exports.Space         = Space;
module.exports.pointYamlType = pointYamlType;
module.exports.spaceYamlType = spaceYamlType;
module.exports.SPACE_SCHEMA  = SPACE_SCHEMA;
