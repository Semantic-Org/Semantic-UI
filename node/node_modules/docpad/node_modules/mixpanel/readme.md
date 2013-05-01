Mixpanel-node
=============
[![Build Status](https://secure.travis-ci.org/carlsverre/mixpanel-node.png)](http://travis-ci.org/carlsverre/mixpanel-node)

This library provides many of the features in the official javascript mixpanel library.  It is easy to use, and fully async.

Installation
------------

    npm install mixpanel

Quick Start
-----------

    // grab the Mixpanel factory
    var Mixpanel = require('mixpanel');

    // create an instance of the mixpanel client
    var mixpanel = Mixpanel.init('6fd9434dba686db2d1ab66b4462a3a67');

    // track an event with optional properties
    mixpanel.track("my event", {
        distinct_id: "some unique client id",
        as: "many",
        properties: "as",
        you: "want"
    });
    mixpanel.track("played_game");

    // create or update a user in Mixpanel Engage
    mixpanel.people.set("billybob", {
        $first_name: "Billy",
        $last_name: "Bob",
        plan: "premium",
        games_played: 1,
        points: 0
    });

    // set a single property on a user
    mixpanel.people.set("billybob", "plan", "free");

    // increment a numeric property
    mixpanel.people.increment("billybob", "games_played");

    // increment a numeric property by a different amount
    mixpanel.people.increment("billybob", "points", 15);

    // increment multiple properties
    mixpanel.people.increment("billybob", {"points": 10, "games_played": 1});

    // delete a user
    mixpanel.people.delete_user("billybob");

    // all functions that send data to mixpanel take an optional
    // callback as the last argument
    mixpanel.track("test", function(err) { if (err) throw err; });

    // import an old event
    var mixpanel_importer = Mixpanel.init('valid mixpanel token', {
        key: "valid api key for project"
    });

    // needs to be in the system once for it to show up in the interface
    mixpanel_importer.track('old event', { gender: '' });

    mixpanel_importer.import("old event", new Date(2012, 4, 20, 12, 34, 56), {
        distinct_id: 'billybob',
        gender: 'male'
    });

Tests
-----

    # in the mixpanel directory
    npm install
    npm test

Attribution/Credits
-------------------

Heavily inspired by the original js library copyright Mixpanel, Inc.
(http://mixpanel.com/)

Copyright (c) 2012 Carl Sverre

Contributions from:
 - [Andres Gottlieb](https://github.com/andresgottlieb)
 - [Ken Perkins](https://github.com/kenperkins)
 - [Nathan Rajlich](https://github.com/TooTallNate)
 - [Thomas Watson Steen](https://github.com/watson)

License
-------------------

Released under the MIT license.  See file called LICENSE for more
details.
