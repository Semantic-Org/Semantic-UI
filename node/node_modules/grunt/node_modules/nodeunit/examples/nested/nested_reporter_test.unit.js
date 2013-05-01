var testCase  = require('nodeunit').testCase;
/* 
 This is an example test suite to demonstrate the nested test reporter.
 Run with --reporter nested, e.g.,
 nodeunit --reporter nested nested_reporter_test.unit.js

 The test output should be something like:

    nested_reporter_test.unit.js
    Test 0.1 (pass)
    TC 1
      TC 1.1
        Test 1.1.1 (pass)
    TC 2
      TC 2.1
        TC 2.1.1
          Test 2.1.1.1 (pass)
          Test 2.1.1.2 (pass)
        TC 2.2.1
          Test 2.2.1.1 (pass)
          TC 2.2.1.1
            Test 2.2.1.1.1 (pass)
          Test 2.2.1.2 (pass)
    TC 3
      TC 3.1
        TC 3.1.1
          Test 3.1.1.1 (should fail) (fail) ✖ 
    AssertionError: false == true
      // stack trace here.

    FAILURES: 1/8 assertions failed (6ms)
*/

module.exports = testCase({
    "Test 0.1": function(test) {
        test.ok(true);
        test.done();
    },

    "TC 1": testCase({
        "TC 1.1": testCase({
            "Test 1.1.1": function(test) {
                test.ok(true);
                test.done();
            }
        })
    }),

    "TC 2": testCase({
        "TC 2.1": testCase({
            "TC 2.1.1": testCase({
                "Test 2.1.1.1": function(test) {
                    test.ok(true);
                    test.done();
                },

                "Test 2.1.1.2": function(test) {
                    test.ok(true);
                    test.done();
                }
            }),

            "TC 2.2.1": testCase({
                "Test 2.2.1.1": function(test) {
                    test.ok(true);
                    test.done();
                },

                "TC 2.2.1.1": testCase({
                    "Test 2.2.1.1.1": function(test) {
                        test.ok(true);
                        test.done();
                    },
                }),

                "Test 2.2.1.2": function(test) {
                    test.ok(true);
                    test.done();
                }
            })
        })
    }),

    "TC 3": testCase({
        "TC 3.1": testCase({
            "TC 3.1.1": testCase({
                "Test 3.1.1.1 (should fail)": function(test) {
                    test.ok(false);
                    test.done();
                }
            })
        })
    })
});
