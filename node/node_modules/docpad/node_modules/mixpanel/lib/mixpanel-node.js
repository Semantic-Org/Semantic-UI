/*
    Heavily inspired by the original js library copyright Mixpanel, Inc.
    (http://mixpanel.com/)

    Copyright (c) 2012 Carl Sverre

    Released under the MIT license.
*/

var http            = require('http'),
    querystring     = require('querystring'),
    Buffer          = require('buffer').Buffer;

var create_client = function(token, config) {
    var metrics = {};
    
    if(!token) {
        throw new Error("The Mixpanel Client needs a Mixpanel token: `init(token)`");
    }
    
    metrics.config = {
        test: false,
        debug: false
    };
    
    metrics.token = token;
    
    /**
        send_request(data)
        ---
        this function sends an async GET request to mixpanel
        
        data:object                     the data to send in the request
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.send_request = function(endpoint, data, callback) {
        callback = callback || function() {};
        var event_data = new Buffer(JSON.stringify(data));
        var request_data = {
            'data': event_data.toString('base64'),
            'ip': 0
        };

        if (endpoint === '/import') {
            var key = metrics.config.key;
            if (!key) {
                throw new Error("The Mixpanel Client needs a Mixpanel api key when importing old events: `init(token, { key: ... })`");
            }
            request_data.api_key = key;
        }
        
        var request_options = {
            host: 'api.mixpanel.com',
            port: 80,
            headers: {}
        };
    
        if (metrics.config.test) { request_data.test = 1; }
        
        var query = querystring.stringify(request_data);
        
        request_options.path = [endpoint,"?",query].join("");
        
        http.get(request_options, function(res) {
            var data = "";
            res.on('data', function(chunk) {
               data += chunk;
            });
            
            res.on('end', function() {
                var e = (data != '1') ? new Error("Mixpanel Server Error: " + data) : undefined;
                callback(e);
            });
        }).on('error', function(e) {
            if(metrics.config.debug) {
                console.log("Got Error: " + e.message);
            }
            callback(e);
        });
    };
    
    /**
        track(event, properties, callback)
        ---
        this function sends an event to mixpanel.
        
        event:string                    the event name
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.track = function(event, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        // if properties.time exists, use import endpoint
        var endpoint = (typeof(properties.time) === 'number') ? '/import' : '/track';

        properties.token = metrics.token;
        properties.mp_lib = "node";

        var data = {
            'event' : event,
            'properties' : properties
        };
        
        if (metrics.config.debug) {
            console.log("Sending the following event to Mixpanel:");
            console.log(data);
        }
        
        metrics.send_request(endpoint, data, callback);
    };

    /**
        import(event, properties, callback)
        ---
        This function sends an event to mixpanel using the import
        endpoint.  The time argument should be either a Date or Number,
        and should signify the time the event occurred.

        It is highly recommended that you specify the distinct_id
        property for each event you import, otherwise the events will be
        tied to the IP address of the sending machine.

        For more information look at:
        https://mixpanel.com/docs/api-documentation/importing-events-older-than-31-days

        event:string                    the event name
        time:date|number                the time of the event
        properties:object               additional event properties to send
        callback:function(err:Error)    callback is called when the request is
                                        finished or an error occurs
    */
    metrics.import = function(event, time, properties, callback) {
        if (typeof(properties) === 'function' || !properties) {
            callback = properties;
            properties = {};
        }

        if (time === void 0) {
            throw new Error("The import method requires you to specify the time of the event");
        } else if (Object.prototype.toString.call(time) === '[object Date]') {
            time = Math.floor(time.getTime() / 1000);
        }

        properties.time = time;

        metrics.track(event, properties, callback);
    };

    metrics.people = {
        /**
            people.set(distinct_id, prop, to, callback)
            ---
            set properties on an user record in engage
        
            usage:
                
                mixpanel.people.set('bob', 'gender', 'm');

                mixpanel.people.set('joe', {
                    'company': 'acme',
                    'plan': 'premium'
                });
        */
        set: function(distinct_id, prop, to, callback) {
            var $set = {}, data = {};

            if (typeof(prop) === 'object') {
                callback = to;
                $set = prop;
            } else {
                $set[prop] = to;
            }

            var data = {
                '$set': $set,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            }

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }
            
            metrics.send_request('/engage', data, callback);
        },

        /**
            people.increment(distinct_id, prop, to, callback)
            ---
            increment/decrement properties on an user record in engage
        
            usage:

                mixpanel.people.increment('bob', 'page_views', 1);

                // or, for convenience, if you're just incrementing a counter by 1, you can
                // simply do
                mixpanel.people.increment('bob', 'page_views');

                // to decrement a counter, pass a negative number
                mixpanel.people.increment('bob', 'credits_left', -1);

                // like mixpanel.people.set(), you can increment multiple properties at once:
                mixpanel.people.increment('bob', {
                    counter1: 1,
                    counter2: 3,
                    counter3: -2
                });
        */
        increment: function(distinct_id, prop, by, callback) {
            var $add = {}, data = {};

            if (typeof(prop) === 'object') {
                callback = by;
                Object.keys(prop).forEach(function(key) {
                    var val = prop[key];

                    if (isNaN(parseFloat(val))) {
                        if (metrics.config.debug) {
                            console.error("Invalid increment value passed to mixpanel.people.increment - must be a number");
                            console.error("Passed " + key + ":" + val);
                        }
                        return;
                    } else {
                        $add[key] = val;
                    }
                });
            } else {
                if (!by) { by = 1; }
                $add[prop] = by;
            }

            var data = {
                '$add': $add,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            }

            if(metrics.config.debug) {
                console.log("Sending the following data to Mixpanel (Engage):");
                console.log(data);
            }
            
            metrics.send_request('/engage', data, callback);
        },

        /**
            people.delete_user(distinct_id, callback)
            ---
            delete an user record in engage
        
            usage:

                mixpanel.people.delete_user('bob');
        */
        delete_user: function(distinct_id, callback) {
            var data = {
                '$delete': distinct_id,
                '$token': metrics.token,
                '$distinct_id': distinct_id
            };

            if(metrics.config.debug) {
                console.log("Deleting the user from engage:", distinct_id);
            }
            
            metrics.send_request('/engage', data, callback);
        }
    };
    
    /**
        set_config(config)
        ---
        Modifies the mixpanel config
        
        config:object       an object with properties to override in the
                            mixpanel client config
    */
    metrics.set_config = function(config) {
        for (var c in config) {
            if (config.hasOwnProperty(c)) {
                metrics.config[c] = config[c];
            }
        }
    };

    if (config) {
        metrics.set_config(config);
    }
    
    return metrics;
};

// module exporting
module.exports = {
    Client: function(token) {
        console.warn("The function `Client(token)` is deprecated.  It is now called `init(token)`.");
        return create_client(token);
    },
    init: create_client
};
