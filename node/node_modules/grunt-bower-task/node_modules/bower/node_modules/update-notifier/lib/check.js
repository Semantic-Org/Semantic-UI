'use strict';

var updateNotifier = require('./update-notifier');
var options = JSON.parse(process.argv[2]);

var updateNotifier = new updateNotifier.UpdateNotifier(options);
updateNotifier.checkNpm(function(err, update) {
    if (err) {
        process.exit(1);
    }

    if (update.type && update.type !== 'latest') {
        updateNotifier.config.set('update', update);
    }

    // Call process exit explicitly to terminate the child process
    // Otherwise the child process will run forever (according to nodejs docs)
    process.exit();
});