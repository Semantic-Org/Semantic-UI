var common = require('../common');
var assert = common.assert;
var stackTrace = require(common.dir.lib + '/stack-trace');

(function testBasic() {
  var trace = stackTrace.get();

  assert.strictEqual(trace[0].getFunction(), testBasic);
  assert.strictEqual(trace[0].getFunctionName(), 'testBasic');
  assert.strictEqual(trace[0].getFileName(), __filename);
})();

(function testWrapper() {
  (function testBelowFn() {
    var trace = stackTrace.get(testBelowFn);
    assert.strictEqual(trace[0].getFunction(), testWrapper);
    assert.strictEqual(trace[0].getFunctionName(), 'testWrapper');
  })();
})();


(function deep1() {
  (function deep2() {
    (function deep3() {
      (function deep4() {
        (function deep5() {
          (function deep6() {
            (function deep7() {
              (function deep8() {
                (function deep9() {
                  (function deep10() {
                    (function deep10() {
                      var trace = stackTrace.get();
                      var hasFirstCallSite = trace.some(function(callSite) {
                        return callSite.getFunctionName() === 'deep1';
                      });

                      assert.ok(hasFirstCallSite);
                    })();
                  })();
                })();
              })();
            })();
          })();
        })();
      })();
    })();
  })();
})();
