/*
 *   Test utils.betterErrors. utils.betterErrors should provide sensible error messages even when the error does not
 *   contain expected, actual or operator.
 */
var assert = require("../lib/assert");
var should = require("should");
var types = require("../lib/types");
var util = require('util');
var utils = require("../lib/utils");

function betterErrorStringFromError(error) {
    var assertion = types.assertion({error: error});
    var better = utils.betterErrors(assertion);
    return better.error.stack.toString();
}

function performBasicChecks(betterErrorString) {
    betterErrorString.should.include("AssertionError");
    betterErrorString.should.include("test-bettererrors");
    betterErrorString.should.not.include("undefined");
}

/**
 * Control test. Provide an AssertionError that contains actual, expected operator values.
 * @param test the test object from nodeunit
 */
exports.testEqual = function (test) {
    try {
        assert.equal(true, false);
    } catch (error) {
        var betterErrorString = betterErrorStringFromError(error);
        performBasicChecks(betterErrorString);
        betterErrorString.should.include("true");
        betterErrorString.should.include("false");
        betterErrorString.should.include("==");
        test.done();
    }
};

/**
 * Test an AssertionError that does not contain actual, expected or operator values.
 * @param test the test object from nodeunit
 */
exports.testAssertThrows = function (test) {
    try {
        assert.throws(function () {
        });
    } catch (error) {
        var betterErrorString = betterErrorStringFromError(error);
        performBasicChecks(betterErrorString);
        test.done();
    }
};

/**
 * Test with an error that is not an AssertionError.
 * @param test the test object from nodeunit
 */
exports.testNonAssertionError = function (test) {
    try {
        throw new Error("test error");
    } catch (error) {
        var betterErrorString = betterErrorStringFromError(error);
        betterErrorString.should.not.include("AssertionError");
        betterErrorString.should.include("Error");
        betterErrorString.should.include("test error");
        betterErrorString.should.include("test-bettererrors");
        betterErrorString.should.not.include("undefined");
        test.done();
    }
};
