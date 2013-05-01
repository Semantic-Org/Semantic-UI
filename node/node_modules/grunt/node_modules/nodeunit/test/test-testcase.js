/*  THIS FILE SHOULD BE BROWSER-COMPATIBLE JS!
 *  You can use @REMOVE_LINE_FOR_BROWSER to remove code from the browser build.
 *  Only code on that line will be removed, its mostly to avoid requiring code
 *  that is node specific
 */

var nodeunit = require('../lib/nodeunit'); // @REMOVE_LINE_FOR_BROWSER

exports.testTestCase = function (test) {
    test.expect(7);
    var call_order = [];
    var s = {
        setUp: function (callback) {
            call_order.push('setUp');
            test.equals(this.one, undefined, 'in setUp, this.one not set');
            this.one = 1;
            callback();
        },
        tearDown: function (callback) {
            call_order.push('tearDown');
            test.ok(true, 'tearDown called');
            callback();
        },
        test1: function (t) {
            call_order.push('test1');
            test.equals(this.one, 1, 'in test1, this.one is 1');
            this.one = 2;
            t.done();
        },
        test2: function (t) {
            call_order.push('test2');
            test.equals(this.one, 1, 'in test2, this.one is still 1');
            t.done();
        }
    };
    nodeunit.runSuite(null, s, {}, function () {
        test.same(call_order, [
            'setUp', 'test1', 'tearDown',
            'setUp', 'test2', 'tearDown'
        ]);
        test.done();
    });
};

exports.tearDownAfterError = function (test) {
    test.expect(1);
    var s = {
        tearDown: function (callback) {
            test.ok(true, 'tearDown called');
            callback();
        },
        test: function (t) {
            throw new Error('some error');
        }
    };
    nodeunit.runSuite(null, s, {}, function () {
        test.done();
    });
};

exports.catchSetUpError = function (test) {
    test.expect(2);
    var test_error = new Error('test error');
    var s = {
        setUp: function (callback) {
            throw test_error;
        },
        test: function (t) {
            test.ok(false, 'test function should not be called');
            t.done();
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.equal(assertions.length, 1);
        test.equal(assertions[0].error, test_error);
        test.done();
    });
};

exports.setUpErrorCallback = function (test) {
    test.expect(2);
    var test_error = new Error('test error');
    var s = {
        setUp: function (callback) {
            callback(test_error);
        },
        test: function (t) {
            test.ok(false, 'test function should not be called');
            t.done();
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.equal(assertions.length, 1);
        test.equal(assertions[0].error, test_error);
        test.done();
    });
};

exports.catchTearDownError = function (test) {
    test.expect(2);
    var test_error = new Error('test error');
    var s = {
        tearDown: function (callback) {
            throw test_error;
        },
        test: function (t) {
            t.done();
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.equal(assertions.length, 1);
        test.equal(assertions[0].error, test_error);
        test.done();
    });
};

exports.tearDownErrorCallback = function (test) {
    test.expect(2);
    var test_error = new Error('test error');
    var s = {
        tearDown: function (callback) {
            callback(test_error);
        },
        test: function (t) {
            t.done();
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.equal(assertions.length, 1);
        test.equal(assertions[0].error, test_error);
        test.done();
    });
};

exports.testErrorAndtearDownError = function (test) {
    test.expect(3);
    var error1 = new Error('test error one');
    var error2 = new Error('test error two');
    var s = {
        tearDown: function (callback) {
            callback(error2);
        },
        test: function (t) {
            t.done(error1);
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.equal(assertions.length, 2);
        test.equal(assertions[0].error, error1);
        test.equal(assertions[1].error, error2);
        test.done();
    });
};

exports.testCaseGroups = function (test) {
    var call_order = [];
    var s = {
        setUp: function (callback) {
            call_order.push('setUp');
            callback();
        },
        tearDown: function (callback) {
            call_order.push('tearDown');
            callback();
        },
        test1: function (test) {
            call_order.push('test1');
            test.done();
        },
        group1: {
            test2: function (test) {
                call_order.push('group1.test2');
                test.done();
            }
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.same(call_order, [
            'setUp',
            'test1',
            'tearDown',
            'setUp',
            'group1.test2',
            'tearDown'
        ]);
        test.done();
    });
};

exports.nestedTestCases = function (test) {
    var call_order = [];
    var s = {
        setUp: function (callback) {
            call_order.push('setUp');
            callback();
        },
        tearDown: function (callback) {
            call_order.push('tearDown');
            callback();
        },
        test1: function (test) {
            call_order.push('test1');
            test.done();
        },
        group1: {
            setUp: function (callback) {
                call_order.push('group1.setUp');
                callback();
            },
            tearDown: function (callback) {
                call_order.push('group1.tearDown');
                callback();
            },
            test2: function (test) {
                call_order.push('group1.test2');
                test.done();
            }
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.same(call_order, [
            'setUp',
            'test1',
            'tearDown',
            'setUp',
            'group1.setUp',
            'group1.test2',
            'group1.tearDown',
            'tearDown'
        ]);
        test.done();
    });
};

exports.deepNestedTestCases = function (test) {
    var val = 'foo';
    var s = {
        setUp: function (callback) {
            val = 'bar';
            callback();
        },
        group1: {
            test: {
                test2: function (test) {
                    test.equal(val, 'bar');
                    test.done();
                }
            }
        }
    };
    nodeunit.runSuite(null, s, {}, function (err, assertions) {
        test.ok(!assertions[0].failed());
        test.equal(assertions.length, 1);
        test.done();
    });
};
