This is a thingie to parse the "yamlish" format used to serialize
objects in the TAP format.

It's like yaml, but just a tiny little bit smaller.

Usage:

    var yamlish = require("yamlish")
    // returns a string like:
    /*
    some:
      object:
        - full
        - of
    pretty: things
    */
    yamlish.encode({some:{object:["full", "of"]}, pretty:"things"})

    // returns the object
    yamlish.decode(someYamlishString)
