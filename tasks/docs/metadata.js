/*******************************
           Summarize Docs
*******************************/

var
  // node dependencies
  console      = require('better-console'),
  fs           = require('fs'),
  YAML         = require('yamljs')
;

var data = {};

/**
 * Test for prefix in string.
 * @param {string} str
 * @param {string} prefix
 * @return {boolean}
 */
function startsWith(str, prefix) {
  return str.indexOf(prefix) === 0;
};

/**
 * Parses a file for metadata and stores result in data object.
 * @param {File} file - object provided by map-stream.
 * @param {function(?,File)} - callback provided by map-stream to
 * reply when done.
 */
function parseFile(file, cb) {

  if (file.isNull())
    return cb(null, file); // pass along
  if (file.isStream())
    return cb(new Error("Streaming not supported"));

  try {

    var
    /** @type {string} */
    text = String(file.contents.toString('utf8')),
    lines = text.split('\n');

    if (!lines)
      return;

    var filename = file.path;
    filename = filename.substring(0, filename.length - 4);
    var key = 'server/documents';
    var position = filename.indexOf(key);
    if (position < 0)
      return cb(null, file);
    filename = filename.substring(position + key.length + 1, filename.length);

    //console.log('Parsing ' + filename);

    var n = lines.length,
        active = false,
        yaml = [],
        line
    ;

    var line;
    for (var i = 0; i < n; i++) {
      line = lines[i];

      // Wait for metadata block to begin
      if (!active) {
        if (startsWith(line, '---'))
          active = true;
        continue;
      }


      // End of metadata block, stop parsing.
      if (startsWith(line, '---'))
        break;

      yaml.push(line);
    }

    // Parse yaml.
    var meta = YAML.parse(yaml.join('\n'));
    meta.category = meta.type;
    meta.filename = filename;
    meta._title = meta.title; // preserve original, just in case
    meta.title = meta.type + ': ' + meta.title;
    // Primary key will by filepath
    data[filename] = meta;

    //console.log("Parsed " + filename + ": " + JSON.stringify(meta));

  } catch(e) {
    console.log(e);
  }

  cb(null,file);

}

/**
 * Export function expected by map-stream.
 */
module.exports = {
  result: data,
  parser: parseFile
};
