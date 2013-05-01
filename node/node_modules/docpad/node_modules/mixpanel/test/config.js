var Mixpanel = require('../lib/mixpanel-node');

exports.config = {
    setUp: function(cb) {
        this.mixpanel = Mixpanel.init('asjdf');
        cb();
    },

    "is set to correct defaults": function(test) {
        test.deepEqual(this.mixpanel.config,
                       { test: false, debug: false },
                       "default config is incorrect");
        test.done();
    },

    "is modified by set_config": function(test) {
        test.equal(this.mixpanel.config.test, false, "default config has incorrect value for test");

        this.mixpanel.set_config({ test: true });

        test.equal(this.mixpanel.config.test, true, "set_config failed to modify the config");

        test.done();
    },

    "can be set during init": function(test) {
        var mp = Mixpanel.init('token', { test: true });

        test.equal(mp.config.test, true, "init() didn't set the config correctly");
        test.done();
    }
};
