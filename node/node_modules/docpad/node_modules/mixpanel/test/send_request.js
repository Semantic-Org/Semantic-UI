var Mixpanel    = require('../lib/mixpanel-node'),
    Sinon       = require('sinon'),
    http        = require('http'),
    events      = require('events');

exports.send_request = {
    setUp: function(next) {
        this.mixpanel = Mixpanel.init('token');

        Sinon.stub(http, 'get');

        this.http_emitter = new events.EventEmitter;
        this.res = new events.EventEmitter;

        http.get.returns(this.http_emitter);
        http.get.callsArgWith(1, this.res);

        next();
    },

    tearDown: function(next) {
        http.get.restore();

        next();
    },

    "sends correct data": function(test) {
        var endpoint = "/track",
            data = {
                event: 'test',
                properties: {
                    key1: 'val1',
                    token: 'token',
                    time: 1346876621
                }
            };

        var expected_http_get = {
            host: 'api.mixpanel.com',
            port: 80,
            headers: {},
            path: '/track?data=eyJldmVudCI6InRlc3QiLCJwcm9wZXJ0aWVzIjp7ImtleTEiOiJ2YWwxIiwidG9rZW4iOiJ0b2tlbiIsInRpbWUiOjEzNDY4NzY2MjF9fQ%3D%3D&ip=0'
        };

        this.mixpanel.send_request(endpoint, data);

        test.ok(http.get.calledWithMatch(expected_http_get), "send_request didn't call http.get with correct arguments");

        test.done();
    },

    "handles mixpanel errors": function(test) {
        test.expect(1);
        this.mixpanel.send_request("/track", { event: "test" }, function(e) {
            test.equal(e.message, 'Mixpanel Server Error: 0', "error did not get passed back to callback");
            test.done();
        });

        this.res.emit('data', '0');
        this.res.emit('end');
    },

    "handles http.get errors": function(test) {
        test.expect(1);
        this.mixpanel.send_request("/track", { event: "test" }, function(e) {
            test.equal(e, 'error', "error did not get passed back to callback");
            test.done();
        });

        this.http_emitter.emit('error', 'error');
    }
};
