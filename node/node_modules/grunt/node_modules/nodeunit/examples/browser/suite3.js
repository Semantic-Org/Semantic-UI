this.suite3 = {
    'test for ie6,7,8': function (test) {
        test.deepEqual(["test"], ["test"]);
        test.notDeepEqual(["a"], ["b"]);
        test.done();
    }
};
