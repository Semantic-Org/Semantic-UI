/*
  Copyright (C) 2012 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2011 Ariya Hidayat <ariya.hidayat@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


/*jslint browser: true node: true */
/*global load:true, print:true */
var setupBenchmarks,
    fixture;

fixture = [
    'jQuery 1.7.1',
    'jQuery 1.6.4',
    'jQuery.Mobile 1.0',
    'Prototype 1.7.0.0',
    'Prototype 1.6.1',
    'Ext Core 3.1.0',
    'Ext Core 3.0.0',
    'MooTools 1.4.1',
    'MooTools 1.3.2',
    'Backbone 0.5.3',
    'Underscore 1.2.3'
];

function slug(name) {
    'use strict';
    return name.toLowerCase().replace(/\s/g, '-');
}

function kb(bytes) {
    'use strict';
    return (bytes / 1024).toFixed(1);
}

if (typeof window !== 'undefined') {
    // Run all tests in a browser environment.
    setupBenchmarks = function () {
        'use strict';

        function id(i) {
            return document.getElementById(i);
        }

        function setText(id, str) {
            var el = document.getElementById(id);
            if (typeof el.innerText === 'string') {
                el.innerText = str;
            } else {
                el.textContent = str;
            }
        }

        function enableRunButtons() {
            id('runquick').disabled = false;
            id('runfull').disabled = false;
        }

        function disableRunButtons() {
            id('runquick').disabled = true;
            id('runfull').disabled = true;
        }

        function createTable() {
            var str = '',
                index,
                test,
                name;

            str += '<table>';
            str += '<thead><tr><th>Source</th><th>Size (KiB)</th>';
            str += '<th>Time (ms)</th><th>Variance</th></tr></thead>';
            str += '<tbody>';
            for (index = 0; index < fixture.length; index += 1) {
                test = fixture[index];
                name = slug(test);
                str += '<tr>';
                str += '<td>' + test + '</td>';
                str += '<td id="' + name + '-size"></td>';
                str += '<td id="' + name + '-time"></td>';
                str += '<td id="' + name + '-variance"></td>';
                str += '</tr>';
            }
            str += '<tr><td><b>Total</b></td>';
            str += '<td id="total-size"></td>';
            str += '<td id="total-time"></td>';
            str += '<td></td></tr>';
            str += '</tbody>';
            str += '</table>';

            id('result').innerHTML = str;
        }

        function loadTests() {

            var index = 0,
                totalSize = 0;

            function load(test, callback) {
                var xhr = new XMLHttpRequest(),
                    src = '3rdparty/' + test + '.js';

                window.data = window.data || {};
                window.data[test] = '';

                try {
                    xhr.timeout = 30000;
                    xhr.open('GET', src, true);

                    xhr.ontimeout = function () {
                        setText('status', 'Error: time out while loading ' + test);
                        callback.apply();
                    };

                    xhr.onreadystatechange = function () {
                        var success = false,
                            size = 0;

                        if (this.readyState === XMLHttpRequest.DONE) {
                            if (this.status === 200) {
                                window.data[test] = this.responseText;
                                size = this.responseText.length;
                                totalSize += size;
                                success = true;
                            }
                        }

                        if (success) {
                            setText(test + '-size', kb(size));
                        } else {
                            setText('status', 'Please wait. Error loading ' + src);
                            setText(test + '-size', 'Error');
                        }

                        callback.apply();
                    };

                    xhr.send(null);
                } catch (e) {
                    setText('status', 'Please wait. Error loading ' + src);
                    callback.apply();
                }
            }

            function loadNextTest() {
                var test;

                if (index < fixture.length) {
                    test = fixture[index];
                    index += 1;
                    setText('status', 'Please wait. Loading ' + test +
                            ' (' + index + ' of ' + fixture.length + ')');
                    window.setTimeout(function () {
                        load(slug(test), loadNextTest);
                    }, 100);
                } else {
                    setText('total-size', kb(totalSize));
                    setText('status', 'Ready.');
                    enableRunButtons();
                }
            }

            loadNextTest();
        }

        function runBenchmarks(suite) {

            var index = 0,
                totalTime = 0;

            function reset() {
                var i, name;
                for (i = 0; i < fixture.length; i += 1) {
                    name = slug(fixture[i]);
                    setText(name + '-time', '');
                    setText(name + '-variance', '');
                }
                setText('total-time', '');
            }

            function run() {
                var el, test, source, benchmark;

                if (index >= suite.length) {
                    setText('total-time', (1000 * totalTime).toFixed(1));
                    setText('status', 'Ready.');
                    enableRunButtons();
                    return;
                }

                test = slug(suite[index]);
                el = id(test);
                source = window.data[test];
                setText(test + '-time', 'Running...');

                // Force the result to be held in this array, thus defeating any
                // possible "dead core elimination" optimization.
                window.tree = [];

                benchmark = new window.Benchmark(test, function (o) {
                    var syntax = window.esprima.parse(source);
                    window.tree.push(syntax.body.length);
                }, {
                    'onComplete': function () {
                        setText(this.name + '-time', (1000 * this.stats.mean).toFixed(1));
                        setText(this.name + '-variance', (1000 * this.stats.variance).toFixed(1));
                        totalTime += this.stats.mean;
                    }
                });

                window.setTimeout(function () {
                    benchmark.run();
                    index += 1;
                    window.setTimeout(run, 211);
                }, 211);
            }


            disableRunButtons();
            setText('status', 'Please wait. Running benchmarks...');

            reset();
            run();
        }

        id('runquick').onclick = function () {
            runBenchmarks(['jQuery 1.7.1', 'jQuery.Mobile 1.0', 'Backbone 0.5.3']);
        };

        id('runfull').onclick = function () {
            runBenchmarks(fixture);
        };

        setText('benchmarkjs-version', ' version ' + window.Benchmark.version);
        setText('version', window.esprima.version);

        createTable();
        disableRunButtons();
        loadTests();
    };
} else {

    // UMD workaround for V8 shell.
    var window;

    (function (global) {
        'use strict';
        var Benchmark,
            esprima,
            dirname,
            option,
            fs,
            readFileSync,
            log;

        if (typeof require === 'undefined') {
            dirname = 'test';
            load(dirname + '/3rdparty/benchmark.js');

            window = global;
            load(dirname + '/../esprima.js');

            Benchmark = global.Benchmark;
            esprima = global.esprima;
            readFileSync = global.read;
            log = print;
        } else {
            Benchmark = require('./3rdparty/benchmark');
            esprima = require('../esprima');
            fs = require('fs');
            option = process.argv[2];
            readFileSync = function readFileSync(filename) {
                return fs.readFileSync(filename, 'utf-8');
            };
            dirname = __dirname;
            log = console.log.bind(console);
        }

        function runTests(tests) {
            var index,
                tree = [],
                totalTime = 0,
                totalSize = 0;

            tests.reduce(function (suite, filename) {
                var source = readFileSync(dirname + '/3rdparty/' + slug(filename) + '.js'),
                    size = source.length;
                totalSize += size;
                return suite.add(filename, function () {
                    var syntax = esprima.parse(source);
                    tree.push(syntax.body.length);
                }, {
                    'onComplete': function (event, bench) {
                        log(this.name +
                            ' size ' + kb(size) +
                            ' time ' + (1000 * this.stats.mean).toFixed(1) +
                            ' variance ' + (1000 * this.stats.variance).toFixed(1));
                        totalTime += this.stats.mean;
                    }
                });
            }, new Benchmark.Suite()).on('complete', function () {
                log('Total size ' + kb(totalSize) +
                    ' time ' + (1000 * totalTime).toFixed(1));
            }).run();
        }

        if (option === 'quick') {
            runTests(['jQuery 1.7.1', 'jQuery.Mobile 1.0', 'Backbone 0.5.3']);
        } else {
            runTests(fixture);
        }
    }(this));
}
/* vim: set sw=4 ts=4 et tw=80 : */
