/*
 * prompt-test.js: Tests for prompt.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var assert = require('assert'),
    vows = require('vows'),
    prompt = require('../lib/prompt'),
    helpers = require('./helpers');

vows.describe('prompt').addBatch({
  "When using prompt": {
    topic: function () {
      //
      // Reset the prompt for mock testing
      //
      prompt.started = false;
      prompt.start({
        stdin: helpers.stdin,
        stdout: helpers.stdout
      });

      return null;
    },
    "the readLine() method": {
      topic: function () {
        prompt.readLine(this.callback);
        helpers.stdin.write('testing\n');
      },
      "should respond with data from the stdin stream": function (err, input) {
        assert.isNull(err);
        assert.equal(input, 'testing');
      }
    },
    "the readLineHidden() method": {
      "when given backspaces": {
        topic: function () {
          prompt.readLineHidden(this.callback);
          helpers.stdin.write('no-\x08backspace.\x7f');
          helpers.stdin.write('\n');
        },
        "should remove the proper characters": function (err,input) {
          assert.isNull(err);
          assert.equal(input, 'nobackspace');
        }
      },
      topic: function () {
        prompt.readLineHidden(this.callback);
        helpers.stdin.write('testing');
        helpers.stdin.write('\r\n');
      },
      "should respond with data from the stdin stream": function (err, input) {
        assert.isNull(err);
        assert.equal(input, 'testing');
      }
    },
    "the getInput() method": {
      "with a simple string prompt": {
        topic: function () {
          var that = this;
          helpers.stdout.once('data', function (msg) {
            that.msg = msg;
          })

          prompt.getInput('test input', this.callback);
          helpers.stdin.write('test value\n');
        },
        "should prompt to stdout and respond with data": function (err, input) {
          assert.isNull(err);
          assert.equal(input, 'test value');
          assert.isTrue(this.msg.indexOf('test input') !== -1);
        }
      },
      "with any field that is not supposed to be empty": {
        "and we don't provide any input": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            });

            helpers.stderr.once('data', function (msg) {
              that.errmsg = msg;
            });

            prompt.getInput(helpers.properties.notblank, function () {});
            prompt.once('invalid', this.callback.bind(null, null))
            helpers.stdin.write('\n');
          },

          "should prompt with an error": function (ign, prop, input) {
            assert.isObject(prop);
            assert.equal(input, '');
            assert.isTrue(this.errmsg.indexOf('Invalid input') !== -1);
            assert.isTrue(this.msg.indexOf('notblank') !== -1);
          }
        }
      },
      "with a hidden field that is not supposed to be empty": {
        "and we provide valid input": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            });

            prompt.getInput('password', this.callback);
            helpers.stdin.write('trustno1\n');
          },

          "should prompt to stdout and respond with data": function (err, input) {
            assert.isNull(err);
            assert.equal(input, 'trustno1');
            assert.isTrue(this.msg.indexOf('password') !== -1);
          }
        },
        "and we don't provide an input": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            });

            helpers.stderr.once('data', function (msg) {
              that.errmsg = msg;
            });

            prompt.getInput(helpers.properties.password, function () {});
            prompt.once('invalid', this.callback.bind(null, null))
            helpers.stdin.write('\n');
          },
          "should prompt with an error": function (ign, prop, input) {
            assert.isObject(prop);
            assert.equal(input, '');
            assert.isTrue(this.errmsg.indexOf('Invalid input') !== -1);
            assert.isTrue(this.msg.indexOf('password') !== -1);
          }
        }
      },
      "with a complex property prompt": {
        "and a valid input": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            });

            prompt.getInput(helpers.properties.username, this.callback);
            helpers.stdin.write('some-user\n');
          },
          "should prompt to stdout and respond with data": function (err, input) {
            assert.isNull(err);
            assert.equal(input, 'some-user');
            assert.isTrue(this.msg.indexOf('username') !== -1);
          }
        },
        "and an invalid input": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            });

            helpers.stderr.once('data', function (msg) {
              that.errmsg = msg;
            })

            prompt.getInput(helpers.properties.username, this.callback);

            prompt.once('invalid', function () {
              prompt.once('prompt', function () {
                process.nextTick(function () {
                  helpers.stdin.write('some-user\n');
                })
              })
            });

            helpers.stdin.write('some -user\n');
          },
          "should prompt with an error before completing the operation": function (err, input) {
            assert.isNull(err);
            assert.equal(input, 'some-user');
            assert.isTrue(this.errmsg.indexOf('Invalid input') !== -1);
            assert.isTrue(this.msg.indexOf('username') !== -1);
          }
        },
        "with an invalid validator (array)": {
          topic: function () {
            prompt.getInput(helpers.properties.badValidator, this.callback);
          },
          "should respond with an error": function (err, ign) {
            assert.isTrue(!!err);
          }
        }
      }
    },
    "the get() method": {
      "with a simple string prompt": {
        "that is not a property in prompt.properties": {
          topic: function () {
            var that = this;
            helpers.stdout.once('data', function (msg) {
              that.msg = msg;
            })

            prompt.get('test input', this.callback);
            helpers.stdin.write('test value\n');
          },
          "should prompt to stdout and respond with the value": function (err, result) {
            assert.isNull(err);
            assert.include(result, 'test input');
            assert.equal(result['test input'], 'test value');
            assert.isTrue(this.msg.indexOf('test input') !== -1);
          }
        },
        "that is a property name in prompt.properties": {
          "with a default value": {
            topic: function () {
              var that = this;

              helpers.stdout.once('data', function (msg) {
                that.msg = msg;
              });

              prompt.properties['riffwabbles'] = helpers.properties['riffwabbles'];
              prompt.get('riffwabbles', this.callback);
              helpers.stdin.write('\n');
            },
            "should prompt to stdout and respond with the default value": function (err, result) {
              assert.isNull(err);
              assert.isTrue(this.msg.indexOf('riffwabbles') !== -1);
              assert.isTrue(this.msg.indexOf('(foobizzles)') !== -1);
              assert.include(result, 'riffwabbles');
              assert.equal(result['riffwabbles'], helpers.properties['riffwabbles'].default);
            }
          },
          "with a sync function validator": {
            topic: function () {
              var that = this;

              helpers.stdout.once('data', function (msg) {
                that.msg = msg;
              });

              prompt.get(helpers.properties.fnvalidator, this.callback);
              helpers.stdin.write('fn123\n');
            },
            "should accept a value that is checked": function (err, result) {
              assert.isNull(err);
              assert.equal(result['fnvalidator'],'fn123');
            }
          },
          "with a callback validator": {
            topic: function () {
              var that = this;

              helpers.stdout.once('data', function (msg) {
                that.msg = msg;
              });

              prompt.get(helpers.properties.cbvalidator, this.callback);
              helpers.stdin.write('cb123\n');
            },
            "should not accept a value that is correct": function (err, result) {
              assert.isNull(err);
              assert.equal(result['cbvalidator'],'cb123');
            }
          }
        }
      },
      "skip prompt with prompt.overide": {
        topic: function () {
          prompt.override = { coconihet: 'whatever' }
          prompt.get('coconihet', this.callback);    
        }, 
        "skips prompt and uses overide": function (err, results) {
          assert.equal(results.coconihet, 'whatever')
        }
      }
    },
    "the addProperties() method": {
      topic: function () {
        prompt.addProperties({}, ['foo', 'bar'], this.callback);
        helpers.stdin.write('foo\n');
        helpers.stdin.write('bar\n');
      },
      "should add the properties to the object": function (err, obj) {
        assert.isNull(err);
        assert.isObject(obj);
        assert.equal(obj.foo, 'foo');
        assert.equal(obj.bar, 'bar');
      }
    }
  }
}).addBatch({
  "When using prompt": {
    "the history() method": {
      "when used inside of a complex property": {
        "with correct value(s)": {
          topic: function () {
            prompt.get([helpers.properties.animal, helpers.properties.sound], this.callback);
            helpers.stdin.write('dog\n');
            helpers.stdin.write('woof\n');
          },
          "should respond with the values entered": function (err, result) {
            assert.isTrue(!err);
            assert.equal(result.animal, 'dog');
            assert.equal(result.sound, 'woof');
          }
        },
        "with an incorrect value": {
          topic: function () {
            prompt.get([helpers.properties.animal, helpers.properties.sound], function () {});
            prompt.once('invalid', this.callback.bind(null, null));
            helpers.stdin.write('dog\n');
            helpers.stdin.write('meow\n');
          },
          "should prompt for the error": function (ign, property, line) {
            assert.equal(property.name, 'sound');
            assert.equal(line, 'meow');
          }
        }
      }
    }
  }
}).addBatch({
  "when using prompt": {
    topic: function () {
      //
      // Reset the prompt for mock testing
      //
      prompt.started = false;
      prompt.start({
        stdin: helpers.stdin,
        stdout: helpers.stdout
      });

      return null;
    },
    "the get() method": {
      topic: function () {
        prompt.override = { xyz: 468, abc: 123 }
        prompt.get(['xyz', 'abc'], this.callback);
      },
      "should respond with overrides": function (err, results) {
        assert.isNull(err);
        assert.deepEqual(results, { xyz: 468, abc: 123 });
      }
    }
  }
}).addBatch({
  "when using prompt": {
    topic: function () {
      //
      // Reset the prompt for mock testing
      //
      prompt.started = false;
      prompt.start({
        stdin: helpers.stdin,
        stdout: helpers.stdout
      });

      return null;
    },
    "with fancy properties": {
      "the get() method": {
        topic: function () {
          prompt.override = { UVW: 5423, DEF: 64235 }
          prompt.get([{
            name:'UVW',
            message: 'a custom message',
            default: 6
            },{
            name:'DEF',
            message: 'a custom message',
            default: 6
            }], this.callback);
        },
        "should respond with overrides": function (err, results) {
          assert.isNull(err);
          assert.deepEqual(results, { UVW: 5423, DEF: 64235 });
        }
      }
    }
  }
}).export(module);


